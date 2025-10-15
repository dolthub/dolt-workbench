import { Child, Command } from "@tauri-apps/plugin-shell";
import { join } from "@tauri-apps/api/path";
import { getConnectionsPath, createFolder, getSocketPath } from "@hooks/useTauri/utils";
import { useState } from "react";


export default function useDoltServer() {
  const [doltServerProcess, setDoltServerProcess] = useState<Child>();

  async function startDoltServer(
    connectionName: string,
    port: string,
    init?: boolean,
    dbName?: string,
  ): Promise<Child | null> {
    const connectionPath = await join(await getConnectionsPath(), connectionName);
    try {
      if (init) {
        if (!dbName) {
          const errorMsg = "Cannot initialize dolt repository without database name";
          console.error(errorMsg);
          throw new Error(errorMsg);
        }

        const dbConnectionPath = await join(connectionPath, dbName);
        await createFolder(dbConnectionPath);
        await initializeDoltRepository(dbConnectionPath);
      }

      return await startServerProcess(connectionPath, port);
    } catch (error) {
      console.error("Failed to set up Dolt server:", error);
      throw error;
    }
  }

  async function initializeDoltRepository(
    dbFolderPath: string,
  ): Promise<void> {
    const command = Command.sidecar('binaries/dolt', [
      "init",
      "--name",
      "local_user",
      "--email",
      "user@local.com"
    ], { cwd: dbFolderPath });

    const output = await command.execute();
    console.log("Dolt init output:", { code: output.code, stdout: output.stdout, stderr: output.stderr });

    if (output.code !== 0) {
      const errorDetails = output.stderr || output.stdout || "Unknown error";
      const initErr = `Error initializing Dolt (code ${output.code}): ${errorDetails}`;
      console.error(initErr);
      throw new Error(initErr);
    }

    if (output.stderr) {
      if (output.stderr.includes("level=warning")) {
        console.warn("Dolt init warning:", output.stderr);
      } else if (output.stderr.includes("level=error")) {
        console.error("Dolt init error:", output.stderr);
        throw new Error(output.stderr);
      } else {
        console.log("Dolt init:", output.stderr);
      }
    }

    console.log(`Dolt initialized: ${output.stdout}`);
  }

  async function startServerProcess(
    dbFolderPath: string,
    port: string,
  ): Promise<Child | null> {
    let argsArray = ["sql-server", "-P", port];

    if (process.platform === "darwin") {
      const socketPath = await getSocketPath();
      argsArray = ["sql-server", "-P", port, "--socket", socketPath];
    }

    console.log("Starting Dolt server...", dbFolderPath, port);
    console.log("Dolt server args:", argsArray);

    const command = Command.sidecar('binaries/dolt', argsArray, {
      cwd: dbFolderPath,
    });

    return new Promise((resolve, reject) => {
      let serverReady = false;

      command.stdout.on('data', (data) => {
        const logMsg = data;
        console.log("dolt server process log", logMsg);

        if (logMsg.includes("level=error") || logMsg.includes(`Port ${port} already in use`)) {
          console.error("Server error:", logMsg);
          reject(new Error(logMsg));
          return;
        }

        if (logMsg.includes("Server ready")) {
          serverReady = true;
        }
      });

      command.stderr.on('data', (data) => {
        const errorMsg = data;
        console.log("dolt server process stderr", errorMsg);

        if (errorMsg.includes("level=warning")) {
          console.warn("Server warning:", errorMsg);
        } else if (errorMsg.includes("level=error") || errorMsg.includes(`Port ${port} already in use`)) {
          console.error("Server error:", errorMsg);
          reject(new Error(errorMsg));
          return;
        }

        if (errorMsg.includes("Server ready")) {
          serverReady = true;
        }
      });

      command.on('close', (data) => {
        console.log('Dolt server closed with code', data.code);
        if (data.code !== 0) {
          reject(new Error(`Dolt server exited with code ${data.code}`));
        }
      });

      command.spawn().then((child) => {
        setDoltServerProcess(child);

        // Check if server is already ready, otherwise wait for it
        const checkReady = () => {
          if (serverReady) {
            resolve(child);
          } else {
            setTimeout(checkReady, 100);
          }
        };

        setTimeout(checkReady, 500);

        setTimeout(() => {
          if (!serverReady) {
            reject(new Error("Timed out waiting for Dolt server to be ready"));
          }
        }, 30000);
      }).catch(reject);
    });
  }

  return { startDoltServer, doltServerProcess };
}
