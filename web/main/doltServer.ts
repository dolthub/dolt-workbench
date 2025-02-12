import fs from "fs";
import path, { resolve } from "path";
import { app, BrowserWindow } from "electron";
import { exec } from "child_process";

type CreateFolderReturnType = {
  error: boolean;
  errorMsg?: string;
};

const isProd = process.env.NODE_ENV === "production";

export function createFolder(folderPath: string): CreateFolderReturnType {
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

//initialize the Dolt repository
function initializeDoltRepository(
  doltPath: string,
  dbFolderPath: string,
  connectionName: string,
  port: number,
  mainWindow: BrowserWindow,
): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(`${doltPath} init`, { cwd: dbFolderPath }, (error, stdout, stderr) => {
      if (error) {
        const errorMessage = `Error initializing Dolt: ${stderr}`;
        console.error(errorMessage);
        mainWindow.webContents.send("server-error", errorMessage);

        // Clean up: Delete the folder
        removeDoltServerFolder(connectionName, port.toString());

        reject(new Error(errorMessage));
        return;
      }

      console.log(`Dolt initialized: ${stdout}`);
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
  connectionName: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const serverProcess = exec(
      `${doltPath} sql-server -P ${port}`,
      {
        cwd: dbFolderPath,
      },
      (error, stdout, stderr) => {
        console.log("error", error);
        console.log("stdout", stdout);
        console.log("stderr", stderr);
      },
    );

    const handleServerLog = (chunk: Buffer) => {
      const logMessage = chunk.toString("utf8");
      console.log("Server Log:", logMessage);
      mainWindow.webContents.send("server-log", logMessage);

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

        reject(new Error(errorMessage));
      } else {
        mainWindow.webContents.send("server-log", errorMessage);
      }

      // Resolve the promise when the server is ready
      if (errorMessage.includes("Server ready")) {
        resolve();
      }
    };

    serverProcess.stdout?.on("data", handleServerLog);
    serverProcess.stderr?.on("data", handleServerError);

    serverProcess.on("exit", (code: number) => {
      const logMessage = `Dolt SQL Server process exited with code ${code}`;
      mainWindow.webContents.send("server-log", logMessage);

      if (code !== 0) {
        reject(new Error(logMessage));
      }

      // Ensure the process is not hanging and the port is released
      if (!serverProcess.killed) {
        console.log("Ensuring the Dolt SQL Server process is terminated");
        serverProcess.kill("SIGTERM"); // Attempt to kill the process gracefully
      }
    });
  });
}

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
      const { error, errorMsg } = createFolder(dbFolderPath);
      if (error) {
        mainWindow.webContents.send("server-error", errorMsg);
        throw new Error(errorMsg);
      }

      // Initialize and start the server without checking if it's already running
      await initializeDoltRepository(
        doltPath,
        dbFolderPath,
        connectionName,
        parseInt(port),
        mainWindow,
      );
      await startServerProcess(
        doltPath,
        dbFolderPath,
        port,
        mainWindow,
        connectionName,
      );
    } else {
      // Check if the server is already running

      // Start the server if it's not running
      await startServerProcess(
        doltPath,
        dbFolderPath,
        port,
        mainWindow,
        connectionName,
      );
    }
  } catch (error) {
    console.error("Failed to set up Dolt server:", error);
    throw error;
  }
}

export function removeDoltServerFolder(connectionName: string, port: string) {
  const dbFolderPath = path.join(
    app.getPath("userData"),
    "databases",
    connectionName,
  );

  // Kill the process using the port
  killProcessUsingPort(port);

  // Delete the folder
  fs.rm(dbFolderPath, { recursive: true, force: true }, err => {
    if (err) {
      console.error("Failed to delete folder:", err);
    } else {
      console.log(`Successfully deleted folder: ${dbFolderPath}`);
    }
  });
}

// kill the process using the port
function killProcessUsingPort(port: string) {
  const command =
    process.platform === "win32"
      ? `netstat -ano | findstr :${port}`
      : `lsof -i :${port} | grep LISTEN`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error(`Failed to find process using port ${port}:`, err);
      return;
    }

    const lines = stdout.split("\n");
    if (lines.length > 0) {
      const line = lines[0].trim();
      const pid =
        process.platform === "win32"
          ? line.split(/\s+/).pop()
          : line.split(/\s+/)[1];

      if (pid) {
        const killCommand =
          process.platform === "win32"
            ? `taskkill /PID ${pid} /F`
            : `kill -9 ${pid}`;

        exec(killCommand, (err, stdout, stderr) => {
          if (err) {
            console.error(`Failed to kill process ${pid}:`, err);
          } else {
            console.log(`Successfully killed process ${pid}`);
          }
        });
      }
    }
  });
}
