import fs from "fs";
import path from "path";
import { app, BrowserWindow } from "electron";
import { exec } from "child_process";

export function createFolder(folderPath: string) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true }); // Create parent directories if they don't exist
    console.log(`Folder created at: ${folderPath}`);
  } else {
    console.log(`Folder already exists at: ${folderPath}`);
  }
}

export function startDoltServer(
  mainWindow: BrowserWindow,
  connectionName: string,
) {
  const dbFolderPath = path.join(
    app.getPath("userData"),
    "databases",
    connectionName,
  );
  // Create the folder for the connection
  createFolder(dbFolderPath);

  // Initialize Dolt repository
  exec("dolt init", { cwd: dbFolderPath }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error initializing Dolt: ${stderr}`);
      mainWindow.webContents.send(
        "server-error",
        `Error initializing Dolt: ${stderr}`,
      );
    }
    console.log(`Dolt initialized: ${stdout}`);
    mainWindow.webContents.send("server-log", `Dolt initialized: ${stdout}`);

    // Start Dolt SQL server
    const serverProcess = exec("dolt sql-server", { cwd: dbFolderPath });

    serverProcess.stdout?.on("data", (chunk: Buffer) => {
      const logMessage = chunk.toString("utf8");
      console.log("Server Log:", logMessage);
      mainWindow.webContents.send("server-log", logMessage);
    });

    serverProcess.stderr?.on("data", (chunk: Buffer) => {
      const errorMessage = chunk.toString("utf8");
      console.error("Server Error:", errorMessage);
      mainWindow.webContents.send("server-error", errorMessage);
    });

    serverProcess.on("close", code => {
      console.log(`Dolt SQL Server process exited with code ${code}`);
      mainWindow.webContents.send(
        "server-log",
        `Dolt SQL Server process exited with code ${code}`,
      );
    });
  });
}
