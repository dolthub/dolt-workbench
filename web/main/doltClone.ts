import path from "path";
import { BrowserWindow } from "electron";
import { ChildProcess, execFile } from "child_process";
import { createFolder, getDatabasesPath, getDoltPaths } from "./filePath";
import { startServerProcess } from "./doltServer";

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
