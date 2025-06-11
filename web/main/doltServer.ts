import path from "path";
import { BrowserWindow } from "electron";
import { ChildProcess, execFile, spawn } from "child_process";
import fs from "fs";
import {
  createFolder,
  getDatabasesPath,
  getDoltPaths,
  getSocketPath,
} from "./helpers/filePath";

export async function startServer(
  mainWindow: BrowserWindow,
  connectionName: string,
  port: string,
  init?: boolean,
): Promise<ChildProcess | null> {
  // Set the path for the database folder
  // In production, it's in the userData directory
  // In development, it's in the build directory since the development userData directory clears its contents every time the app is rerun in dev mode
  const dbFolderPath = path.join(getDatabasesPath(), connectionName);

  const doltPath = getDoltPaths();

  try {
    if (init) {
      // Create the folder for the connection
      const { errorMsg } = createFolder(path.join(dbFolderPath));
      if (errorMsg) {
        mainWindow.webContents.send("server-error", errorMsg);
        throw new Error(errorMsg);
      }

      // Initialize and start the server without checking if it's already running
      await initializeDoltRepository(doltPath, dbFolderPath, mainWindow);
    }

    return await startServerProcess(doltPath, dbFolderPath, port, mainWindow);
  } catch (error) {
    console.error("Failed to set up Dolt server:", error);
    throw error;
  }
}

//initialize the Dolt repository by running `dolt init` in dbFolderPath
function initializeDoltRepository(
  doltPath: string,
  dbFolderPath: string,
  mainWindow: BrowserWindow,
): Promise<void> {
  return new Promise((resolve, reject) => {
    // execFile bypasses the shell, handles spaces in doltPath
    execFile(
      doltPath,
      ["init", "--name", "local_user", "--email", "user@local.com"],
      { cwd: dbFolderPath },
      async (error, stdout, stderr) => {
        if (error) {
          const initErr = `Error initializing Dolt: ${error}`;
          mainWindow.webContents.send("server-error", initErr);

          reject(new Error(initErr));
          return;
        }

        if (stderr) {
          // Check if the message is a warning or an error
          if (stderr.includes("level=warning")) {
            // Treat warnings as non-fatal
            mainWindow.webContents.send("server-warning", stderr);
          } else if (stderr.includes("level=error")) {
            // Treat errors as fatal
            mainWindow.webContents.send("server-error", stderr);

            reject(new Error(stderr));
            return;
          } else {
            mainWindow.webContents.send("server-log", stderr);
          }
        }

        mainWindow.webContents.send(
          "server-log",
          `Dolt initialized: ${stdout}`,
        );
        resolve();
      },
    );
  });
}

export function startServerProcess(
  doltPath: string,
  dbFolderPath: string,
  port: string,
  mainWindow: BrowserWindow,
): Promise<ChildProcess | null> {
  return new Promise((resolve, reject) => {
    const socketPath = getSocketPath();

    console.log("Starting Dolt server...", dbFolderPath, port);
    const argsArray=process.platform==="darwin"?["sql-server", "-P", port, "--socket", socketPath]:["sql-server", "-P", port]
    const doltServerProcess = spawn(
      doltPath,
      argsArray,
      {
        cwd: dbFolderPath,
        stdio: "pipe",
      },
    );

    doltServerProcess.stdout?.on("data", async data => {
      const logMsg = data.toString();
      console.log("dolt server process log", logMsg);
      if (
        logMsg.includes("level=error") ||
        logMsg.includes(`Port ${port} already in use`)
      ) {
        // Treat errors as fatal
        mainWindow.webContents.send("server-error", logMsg);

        reject(new Error(logMsg));
        return;
      }
      mainWindow.webContents.send("server-log", logMsg);
      if (data.toString().includes("Server ready")) {
        resolve(doltServerProcess);
        return;
      }
    });

    doltServerProcess.stderr?.on("data", async data => {
      const errorMsg = data.toString();
      console.log("dolt server process stderr", errorMsg);
      // Check if the message is a warning or an error
      if (errorMsg.includes("level=warning")) {
        // Treat warnings as non-fatal
        mainWindow.webContents.send("server-warning", errorMsg);
      } else if (
        errorMsg.includes("level=error") ||
        errorMsg.includes(`Port ${port} already in use`)
      ) {
        // Treat errors as fatal
        mainWindow.webContents.send("server-error", errorMsg);

        reject(new Error(errorMsg));
        return;
      }
      // Resolve the promise when the server is ready
      if (errorMsg.includes("Server ready")) {
        resolve(doltServerProcess);
        return;
      }
      mainWindow.webContents.send("server-log", errorMsg);
      return;
    });
  });
}
