import fs from "fs";
import path from "path";
import { app } from "electron";

const isProd = process.env.NODE_ENV === "production";

export function getConnectionsPath() {
  if (isProd) {
    // Use ~/.local/share for Linux (more persistent than user data folder, which is ~/.config)
    const linuxDbRoot =
      process.platform === "linux"
        ? path.join(app.getPath("home"), ".local", "share", app.getName())
        : app.getPath("userData");

    return path.join(linuxDbRoot, "connections");
  }
  return path.join(__dirname, "..", "build", "connections");
}

// Returns the path to the Dolt binary based on the platform and environment.
// For production, the binary is stored in the app's resources folder
// For dev, the binary is in the build/[platform] directory.
export function getDoltPaths(): string {
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
      : path.join(__dirname, "..", "build", "appx", "dolt.exe");
  }
}

// This is hacky, but it's necessary for now due to a known issue with the claude-agent-sdk
// https://liruifengv.com/posts/claude-agent-sdk-pitfalls-en/
export function getClaudeCliPaths(): string {
  if (!isProd) {
    return path.join(__dirname, "..", "node_modules", "@anthropic-ai", "claude-agent-sdk", "cli.js");
  }
  if (process.platform === "darwin") {
    return path.join(process.resourcesPath, "node_modules", "@anthropic-ai", "claude-agent-sdk", "cli.js");
  } else if (process.platform === "linux") {
    return path.join(process.resourcesPath, "node_modules", "@anthropic-ai", "claude-agent-sdk", "cli.js");
  } else {
    return path.join(process.resourcesPath, "node_modules", "@anthropic-ai", "node_modules", "claude-agent-sdk", "cli.js");
  }
}

type ErrorReturnType = {
  errorMsg?: string;
};

// create the folder for dolt database
export function createFolder(folderPath: string): ErrorReturnType {
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

export function getSocketPath() {
  // Use the app's temp directory (sandbox-compatible)
  const socketDir = app.getPath("temp");

  // Create a customized filename without special characters
  return path.join(socketDir, "dolt.sock");
}

// Returns the path to the dolt-mcp-server binary based on the platform and environment.
export function getMcpServerPath(): string {
  if (process.platform === "darwin") {
    return isProd
      ? path.join(process.resourcesPath, "..", "MacOS", "dolt-mcp-server")
      : path.join(__dirname, "..", "build", "mac", "dolt-mcp-server");
  } else if (process.platform === "linux") {
    return isProd
      ? path.join(process.resourcesPath, "dolt-mcp-server")
      : path.join(__dirname, "..", "build", "linux", "dolt-mcp-server");
  } else {
    return isProd
      ? path.join(process.resourcesPath, "dolt-mcp-server.exe")
      : path.join(__dirname, "..", "build", "appx", "dolt-mcp-server.exe");
  }
}
