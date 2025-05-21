import fs from "fs";
import path from "path";
import { app, BrowserWindow, IpcMainInvokeEvent } from "electron";
import { rimraf } from "rimraf";
import { ChildProcess, execFile, spawn } from "child_process";
import { v4 as randomUUID } from "uuid";

type ErrorReturnType = {
  errorMsg?: string;
};

const isProd = process.env.NODE_ENV === "production";

function getDatabasesPath() {
  if (isProd) {
    // Use ~/.local/share for Linux (more persistent than ~/.config)
    const linuxDbRoot =
      process.platform === "linux"
        ? path.join(app.getPath("home"), ".local", "share", app.getName())
        : app.getPath("userData");

    return path.join(linuxDbRoot, "databases");
  }
  return path.join(__dirname, "..", "build", "databases");
}

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
      ? path.join(process.resourcesPath, "..", "MacOS", "dolt")
      : path.join(__dirname, "..", "build", "mac", "dolt");
  } else if (process.platform === "linux") {
    return isProd
      ? path.join(process.resourcesPath, "dolt")
      : path.join(__dirname, "..", "build", "linux", "dolt");
  } else {
    return isProd
      ? path.join(process.resourcesPath, "dolt.exe")
      : path.join(__dirname, "..", "build", "appx", "dolt");
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

export async function cloneAndStartDatabase(
  owner: string,
  remoteDatabase: string,
  newDbName: string,
  connectionName: string,
  port: string,
  mainWindow: BrowserWindow,
): Promise<ChildProcess | null> {
  const dbsFolderPath = getDatabasesPath();
  const doltPath = getDoltPaths();
  const connectionFolderPath = path.join(dbsFolderPath, connectionName);
  const dbFolderPath = path.join(connectionFolderPath, newDbName);

  try {
    const { errorMsg } = createFolder(path.join(connectionFolderPath));
    if (errorMsg) {
      mainWindow.webContents.send("server-error", errorMsg);
      throw new Error(errorMsg);
    }
    await cloneDatabase(
      owner,
      remoteDatabase,
      newDbName,
      connectionFolderPath,
      mainWindow,
    );
    return await startServerProcess(doltPath, dbFolderPath, port, mainWindow);
  } catch (error) {
    console.error("Failed to clone database:", error);
    throw error;
  }
}

function cloneDatabase(
  owner: string,
  remoteDatabase: string,
  newDbName: string,
  connectionFolderPath: string,
  mainWindow: BrowserWindow,
): Promise<void> {
  const doltPath = getDoltPaths();

  return new Promise((resolve, reject) => {
    const execOptions = {
      cwd: connectionFolderPath,
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      windowsHide: true,
    };
    mainWindow.webContents.send(
      "clone path",
      connectionFolderPath,
      "execOptions",
      execOptions,
    );
    execFile(
      doltPath,
      ["clone", `${owner}/${remoteDatabase}`, `${newDbName}`],
      execOptions,
      async (error, stdout, stderr) => {
        if (error) {
          console.log(error);
          const errMsg = `Clone failed: ${error.message}`;
          mainWindow.webContents.send("server-error", errMsg);
          return reject(new Error(errMsg));
        }
        if (stderr) {
          console.log(stderr);
          const errMsg = `Clone failed: ${stderr}`;
          mainWindow.webContents.send("server-error", errMsg);
          return reject(new Error(errMsg));
        }
        console.log(stdout);
        mainWindow.webContents.send("server-log", stdout);
        resolve();
      },
    );
  });
}

function startServerProcess(
  doltPath: string,
  dbFolderPath: string,
  port: string,
  mainWindow: BrowserWindow,
): Promise<ChildProcess | null> {
  return new Promise((resolve, reject) => {
    console.log("Starting Dolt server...", dbFolderPath, port);
    const doltServerProcess = spawn(doltPath, ["sql-server", "-P", port], {
      cwd: dbFolderPath,
      stdio: "pipe",
    });

    doltServerProcess.stdout?.on("data", async data => {
      const logMsg = data.toString();
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

export async function removeDoltServerFolder(
  connectionName: string,
  mainWindow: BrowserWindow,
  retries = 3,
): Promise<ErrorReturnType> {
  const dbFolderPath = path.join(getDatabasesPath(), connectionName);
  for (let i = 0; i < retries; i++) {
    try {
      if (process.platform === "darwin") {
        mainWindow.webContents.send("remove db", dbFolderPath);
        await fs.promises.rm(dbFolderPath, { recursive: true, force: true });
      } else {
        await rimraf(dbFolderPath);
      }
      return { errorMsg: undefined };
    } catch (err) {
      if (i === retries - 1) {
        mainWindow.webContents.send(
          "server-error",
          `Failed to delete folder: ${err}`,
        );
        return { errorMsg: `Failed after ${retries} attempts: ${err}` };
      }
      // Wait 500ms before retrying
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  return { errorMsg: "Unexpected error in removeDoltServerFolder" };
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  } else if (typeof error === "string") {
    return error;
  } else {
    return "An unknown error occurred";
  }
}

export async function doltLogin(
  event: IpcMainInvokeEvent,
  connectionName: string,
  mainWindow: BrowserWindow,
  activeProcesses: Map<string, ChildProcess>,
): Promise<{ email: string; username: string }> {
  const requestId = randomUUID();
  return new Promise((resolve, reject) => {
    const dbFolderPath = path.join(getDatabasesPath(), connectionName);
    const doltPath = getDoltPaths();

    // Return the cancellation ID immediately
    event.sender.send("login-started", requestId);

    let timedOut = false;
    const timeoutDuration = 1 * 60 * 1000; // 1 minutes

    let timeoutId = setTimeout(() => {
      timedOut = true;
      if (child) {
        child.kill(); // Terminate the process
      }
      activeProcesses.delete(requestId);
      mainWindow.webContents.send(
        "server-error",
        "Login timed out after 5 minutes",
      );
      reject(new Error("Login timed out"));
    }, timeoutDuration);

    const child = execFile(
      doltPath,
      ["login"],
      { cwd: dbFolderPath, maxBuffer: 1024 * 1024 * 10 },
      async (error, stdout, stderr) => {
        // Early return if timeout already handled
        if (timedOut) return;
        clearTimeout(timeoutId);
        activeProcesses.delete(requestId);

        if (error) {
          mainWindow.webContents.send(
            "server-error: dolt login failed,",
            error,
          );
          return reject(error);
        }

        if (stderr) {
          if (stderr.includes("level=warning")) {
            // Treat warnings as non-fatal
            mainWindow.webContents.send("server-warning", stderr);
          } else if (stderr.includes("level=error")) {
            // Treat errors as fatal
            mainWindow.webContents.send("server-error", stderr);
            return reject(new Error(stderr));
          } else {
            mainWindow.webContents.send("server-log", stderr);
          }
        }
        // Check for successful login pattern
        const successMatch = stdout.match(
          /Key successfully associated with user:\s+([^\s]+)\s+email\s+([^\s]+)/,
        );
        if (successMatch) {
          const [, username, email] = successMatch;
          // Resolve the promise with user data
          resolve({ email, username });
        } else {
          reject(new Error("Login verification failed"));
        }
        mainWindow.webContents.send("server-log", `Dolt login: ${stdout}`);
      },
    );
    activeProcesses.set(requestId, child);
  });
}
