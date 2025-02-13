import fs from "fs";
import path from "path";
import { app, BrowserWindow } from "electron";
import { exec } from "child_process";

type ErrorReturnType = {
  errorMsg?: string;
};

const isProd = process.env.NODE_ENV === "production";

export async function startServer(
  mainWindow: BrowserWindow,
  connectionName: string,
  port: string,
  init?: boolean,
): Promise<void> {
  const dbFolderPath = isProd
    ? path.join(app.getPath("userData"), "databases", connectionName)
    : path.join(__dirname, "..", "build", "databases", connectionName);

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
      await initializeDoltRepository(
        doltPath,
        dbFolderPath,
        connectionName,
        mainWindow,
      );
      await startServerProcess(doltPath, dbFolderPath, port, mainWindow);
    } else {
      await startServerProcess(doltPath, dbFolderPath, port, mainWindow);
    }
  } catch (error) {
    console.error("Failed to set up Dolt server:", error);
    throw error;
  }
}

// create the folder for dolt database
function createFolder(folderPath: string): ErrorReturnType {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true }); // Create parent directories if they don't exist
    console.log(`Folder created at: ${folderPath}`);
    return { errorMsg: undefined };
  } else {
    const errorMsg = `A connection with this name ${folderPath} already exists. Please choose a different name.`;
    console.error(errorMsg);
    return {
      errorMsg,
    };
  }
}

// Returns the path to the Dolt binary based on the platform and environment.
// On macOS, the binary is stored in the app's resources folder in production,
// and in the build/mac directory in dev env .
// On Windows, the same logic applies, but the binary is named "dolt.exe" and in build/appx directory.
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

//initialize the Dolt repository, running dolt init in dbFolderPath
function initializeDoltRepository(
  doltPath: string,
  dbFolderPath: string,
  connectionName: string,
  mainWindow: BrowserWindow,
): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(`${doltPath} init`, { cwd: dbFolderPath }, (error, stdout, stderr) => {
      if (error) {
        const initErr = `Error initializing Dolt: ${error}`;
        mainWindow.webContents.send("server-error", initErr);

        // Clean up: Delete the folder
        const { errorMsg: removeFolderErr } =
          removeDoltServerFolder(dbFolderPath);
        if (removeFolderErr) {
          mainWindow.webContents.send("server-error", removeFolderErr);
        }

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

          // Clean up: Delete the folder
          const { errorMsg: removeFolderErr } =
            removeDoltServerFolder(dbFolderPath);
          if (removeFolderErr) {
            mainWindow.webContents.send("server-error", removeFolderErr);
          }
          reject(new Error(stderr));
          return;
        } else {
          mainWindow.webContents.send("server-log", stderr);
        }
      }

      mainWindow.webContents.send("server-log", `Dolt initialized: ${stdout}`);
      resolve();
    });
  });
}

// start the Dolt SQL server
function startServerProcess(
  doltPath: string,
  dbFolderPath: string,
  port: string,
  mainWindow: BrowserWindow,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const doltServerProcess = exec(
      `${doltPath} sql-server -P ${port}`,
      {
        cwd: dbFolderPath,
      },
      error => {
        if (error) {
          const startServerErr = `Error start Dolt server: ${error}`;
          mainWindow.webContents.send("server-error", startServerErr);

          reject(new Error(startServerErr));
          return;
        }
      },
    );

    const handleServerLog = (chunk: Buffer) => {
      const logMessage = chunk.toString("utf8");
      mainWindow.webContents.send("server-log", logMessage);

      // Resolve the promise when the server is ready
      if (logMessage.includes("Server ready")) {
        resolve();
      }
    };

    const handleServerError = (chunk: Buffer) => {
      const errorMessage = chunk.toString("utf8");

      // Check if the message is a warning or an error
      if (errorMessage.includes("level=warning")) {
        // Treat warnings as non-fatal
        mainWindow.webContents.send("server-warning", errorMessage);
      } else if (errorMessage.includes("level=error")) {
        // Treat errors as fatal
        mainWindow.webContents.send("server-error", errorMessage);

        reject(new Error(errorMessage));
      } else {
        mainWindow.webContents.send("server-log", errorMessage);
      }

      // Resolve the promise when the server is ready
      if (errorMessage.includes("Server ready")) {
        resolve();
      }
    };

    doltServerProcess.stdout?.on("data", handleServerLog);
    doltServerProcess.stderr?.on("data", handleServerError);
    app.on("before-quit", () => {
      if (doltServerProcess) {
        doltServerProcess.kill();
      }
    });
  });
}

export function removeDoltServerFolder(dbFolderPath: string): ErrorReturnType {
  // Delete the folder
  fs.rm(dbFolderPath, { recursive: true, force: true }, err => {
    if (err) {
      return {
        errorMsg: `Failed to delete folder: ${err}`,
      };
    }
  });
  return {
    errorMsg: undefined,
  };
}
