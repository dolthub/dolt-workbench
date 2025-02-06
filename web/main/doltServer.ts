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

function getCommonDoltPaths(): string[] {
  const paths = [];

  if (process.platform === "darwin") {
    // macOS
    paths.push("/usr/local/bin/dolt");
    paths.push("/opt/homebrew/bin/dolt");
    paths.push(path.join(process.env.HOME || "", "bin", "dolt"));
    paths.push(path.join(process.env.HOME || "", "go", "bin", "dolt"));
  } else if (process.platform === "win32") {
    // Windows
    paths.push(path.join("C:", "Program Files", "Dolt", "dolt.exe"));
    paths.push(path.join(process.env.LOCALAPPDATA || "", "Dolt", "dolt.exe"));
  } else if (process.platform === "linux") {
    // Linux
    paths.push("/usr/local/bin/dolt");
    paths.push("/usr/bin/dolt");
    paths.push(path.join(process.env.HOME || "", "bin", "dolt"));
  }

  return paths;
}

function findDoltPath(
  mainWindow: BrowserWindow,
  dbFolder: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Extend PATH temporarily for this process
    const originalPath = process.env.PATH;
    const newPath = [
      "/usr/local/bin",
      "/usr/bin",
      process.env.HOME + "/bin",
      originalPath,
    ].join(path.delimiter);
    process.env.PATH = newPath;

    // First, try the `which` command
    exec("which dolt", { cwd: dbFolder }, (error, stdout, stderr) => {
      process.env.PATH = originalPath; // Restore original PATH after execution

      if (stderr) {
        mainWindow.webContents.send("server-error", stderr);
      }

      if (!error && stdout) {
        resolve(stdout.trim());
        return;
      }

      // If `which` fails, check common paths
      const commonDoltPaths = getCommonDoltPaths();

      for (const doltPath of commonDoltPaths) {
        if (fs.existsSync(doltPath)) {
          resolve(doltPath);
          return;
        }
      }

      // If no path is found, reject with an error
      reject(new Error(`dolt not found in PATH or common locations.`));
    });
  });
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

    findDoltPath(mainWindow, dbFolderPath)
      .then(doltPath => {
        console.log("dolt path", doltPath);

        // Initialize Dolt repository
        exec(
          `${doltPath} init`,
          { cwd: dbFolderPath },
          (error, stdout, stderr) => {
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
            mainWindow.webContents.send(
              "server-log",
              `Dolt initialized: ${stdout}`,
            );

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
                console.log(
                  "Ensuring the Dolt SQL Server process is terminated",
                );
                serverProcess.kill("SIGTERM"); // Attempt to kill the process gracefully
              }
            });
          },
        );
      })
      .catch(error => {
        console.error("Failed to find dolt:", error.message);
        mainWindow.webContents.send("server-error", error.message);
        reject(error);
      });
  });
}
