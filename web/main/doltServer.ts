import fs from "fs";
import path from "path";
import { app, BrowserWindow } from "electron";
import { exec } from "child_process";

type CreateFolderReturnType = {
  error: boolean;
  errorMsg?: string;
};

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

    // Initialize Dolt repository
    exec("dolt init", { cwd: dbFolderPath }, (error, stdout, stderr) => {
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
      const serverProcess = exec(`dolt sql-server -P ${port}`, {
        cwd: dbFolderPath,
      });

      const handleServerLog = (chunk: Buffer) => {
        const logMessage = chunk.toString("utf8");
        console.log("Server Log:", logMessage);
        if (logMessage.includes("already in use")) {
          mainWindow.webContents.send("server-error", logMessage);

          // Clean up: Delete the folder
          fs.rm(dbFolderPath, { recursive: true, force: true }, err => {
            if (err) {
              console.error("Failed to delete folder:", err);
            }
          });

          reject(new Error(logMessage));
        }
        mainWindow.webContents.send("server-log", logMessage);
        if (logMessage.includes("Server ready")) {
          resolve();
        }
      };

      const handleServerError = (chunk: Buffer) => {
        const errorMessage = chunk.toString("utf8");
        console.error(errorMessage);
        if (errorMessage.includes("Server ready")) {
          resolve();
        }
        if (errorMessage.includes("level=error")) {
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
      };

      serverProcess.stdout?.on("data", handleServerLog);
      serverProcess.stderr?.on("data", handleServerError);
    });
  });
}
