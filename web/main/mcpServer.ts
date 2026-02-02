import { ChildProcess, spawn } from "child_process";
import { BrowserWindow } from "electron";
import { getMcpServerPath } from "./helpers/filePath";

export type McpServerConfig = {
  host: string;
  port: number;
  user: string;
  database: string;
};

export function startMcpServer(
  mainWindow: BrowserWindow,
  config: McpServerConfig,
): ChildProcess {
  const mcpServerPath = getMcpServerPath();

  const args = [
    "--stdio",
    "--dolt-host",
    config.host,
    "--dolt-port",
    String(config.port),
    "--dolt-user",
    config.user,
    "--dolt-database",
    config.database,
  ];

  console.log("Starting MCP server...", mcpServerPath, args);

  const mcpServerProcess = spawn(mcpServerPath, args, {
    stdio: "pipe",
  });

  mcpServerProcess.on("error", err => {
    console.error("MCP SERVER PROCESS ERROR:", err);
    mainWindow.webContents.send("mcp-server-error", err.message);
  });

  mcpServerProcess.stdout.on("data", (data: Buffer) => {
    const logMsg = data.toString();
    console.log("mcp server stdout:", logMsg);
    mainWindow.webContents.send("mcp-server-log", logMsg);
  });

  mcpServerProcess.stderr.on("data", (data: Buffer) => {
    const errorMsg = data.toString();
    console.log("mcp server stderr:", errorMsg);
    mainWindow.webContents.send("mcp-server-log", errorMsg);
  });

  mcpServerProcess.on("exit", (code, signal) => {
    console.log(`MCP server exited with code ${code}, signal ${signal}`);
    mainWindow.webContents.send("mcp-server-exit", { code, signal });
  });

  if (mcpServerProcess.pid) {
    console.log("MCP server is running with PID", mcpServerProcess.pid);
  }

  return mcpServerProcess;
}
