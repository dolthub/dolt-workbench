import fs from "fs";
import path from "path";
import { app, BrowserWindow } from "electron";
import { exec } from "child_process";

type CreateFolderReturnType = {
  error: boolean;
  errorMsg?: string;
};

const isProd = process.env.NODE_ENV === "production";

export function createFolder(folderPath: string): CreateFolderReturnType {
  console.log(folderPath, fs.existsSync);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true }); // Create parent directories if they don't exist
    console.log(`Folder created at: ${folderPath}`);
    return { error: false };
  } else {
    const errorMsg = `A connection with this name ${folderPath} already exists. Please choose a different name.`;
    console.error(errorMsg);
    return {
      error: true,
      errorMsg,
    };
  }
}

function getDoltPaths(): string {
  if (process.platform === "darwin") {
    return isProd
      ? path.join(process.resourcesPath, "dolt")
      : path.join(__dirname, "..", "build", "mac", "dolt");
  } else {
    return isProd
      ? path.join(process.resourcesPath, "dolt.exe")
      : path.join(__dirname, "..", "build", "appx", "dolt");
  }
}

export function startDoltServer(
  mainWindow: BrowserWindow,
  connectionName: string,
  port: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const dbFolderPath = path.join(
      app.getPath("userData"),
      "databases",
      connectionName,
    );

    // Create the folder for the connection
    const { error, errorMsg } = createFolder(dbFolderPath);
    if (error) {
      mainWindow.webContents.send("server-error", errorMsg);
      reject(new Error(errorMsg));
      return;
    }
    const doltPath = getDoltPaths();

    console.log("dolt path", doltPath);

    // Initialize Dolt repository
    exec(`${doltPath} init`, { cwd: dbFolderPath }, (error, stdout, stderr) => {
      if (error) {
        const errorMessage = `Error initializing Dolt: ${stderr}`;
        console.error(errorMessage);
        mainWindow.webContents.send("server-error", errorMessage);

        // Clean up: Delete the folder
        fs.rm(dbFolderPath, { recursive: true, force: true }, err => {
          if (err) {
            console.error("Failed to delete folder:", err);
          }
        });

        reject(new Error(errorMessage));
        return;
      }

      console.log(`Dolt initialized: ${stdout}`);
      mainWindow.webContents.send("server-log", `Dolt initialized: ${stdout}`);

      // Start Dolt SQL server
      const serverProcess = exec(`${doltPath} sql-server -P ${port}`, {
        cwd: dbFolderPath,
      });

      const handleServerLog = (chunk: Buffer) => {
        const logMessage = chunk.toString("utf8");
        console.log("Server Log:", logMessage);
        mainWindow.webContents.send("server-log", logMessage);
        if (logMessage.includes("already in use.")) {
          mainWindow.webContents.send("server-error", logMessage);
          // Clean up: Delete the folder
          fs.rm(dbFolderPath, { recursive: true, force: true }, err => {
            if (err) {
              console.error("Failed to delete folder:", err);
            }
          });
          reject(new Error(logMessage));
        }

        // Resolve the promise when the server is ready
        if (logMessage.includes("Server ready")) {
          resolve();
        }
      };

      const handleServerError = (chunk: Buffer) => {
        const errorMessage = chunk.toString("utf8");
        console.error("Server Error:", errorMessage);

        // Check if the message is a warning or an error
        if (errorMessage.includes("level=warning")) {
          // Treat warnings as non-fatal
          mainWindow.webContents.send("server-warning", errorMessage);
        } else if (errorMessage.includes("level=error")) {
          // Treat errors as fatal
          mainWindow.webContents.send("server-error", errorMessage);

          // Clean up: Delete the folder
          fs.rm(dbFolderPath, { recursive: true, force: true }, err => {
            if (err) {
              console.error("Failed to delete folder:", err);
            }
          });

          reject(new Error(errorMessage));
        }
        // Resolve the promise when the server is ready
        if (errorMessage.includes("Server ready")) {
          resolve();
        }
      };

      serverProcess.stdout?.on("data", handleServerLog);
      serverProcess.stderr?.on("data", handleServerError);

      serverProcess.on("close", code => {
        const logMessage = `Dolt SQL Server process exited with code ${code}`;
        console.log(logMessage);
        mainWindow.webContents.send("server-log", logMessage);

        if (code !== 0) {
          // Clean up: Delete the folder
          fs.rm(dbFolderPath, { recursive: true, force: true }, err => {
            if (err) {
              console.error("Failed to delete folder:", err);
            }
          });

          reject(new Error(logMessage));
        }

        // Ensure the process is not hanging and the port is released
        if (!serverProcess.killed) {
          console.log("Ensuring the Dolt SQL Server process is terminated");
          serverProcess.kill("SIGTERM"); // Attempt to kill the process gracefully
        }
      });
    });
  });
}
