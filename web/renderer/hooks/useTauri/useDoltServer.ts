import { Child, Command } from "@tauri-apps/plugin-shell";
import { join } from "@tauri-apps/api/path";
import {
  getConnectionsPath,
  createFolder,
  getSocketPath,
  removeDoltServerFolder,
  getErrorMessage,
} from "@hooks/useTauri/utils";
import { useTauriContext } from "@contexts/TauriContext";


export default function useDoltServer() {
  const { doltServerProcess } = useTauriContext();

  async function startDoltServer(
    connectionName: string,
    port: string,
    init?: boolean,
    dbName?: string,
  ) {
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

      const serverProcess = await startServerProcess(connectionPath, port);
      if (!serverProcess) {
        throw new Error("Failed to start Dolt server");
      }
    } catch (error) {
      if (doltServerProcess.current) {
        await doltServerProcess.current.kill();
        doltServerProcess.current = undefined;
      }
      if (init) {
        try {
          const { errorMsg } = await removeDoltServerFolder(connectionName);
          if (errorMsg) {
            console.error("Cleanup failed: ", errorMsg);
          }
        } catch (cleanupError) {
          console.error("Folder deletion error: ", cleanupError);
        }
      }
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
  ): Promise<Child | undefined> {
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
        doltServerProcess.current = child;

        // Check if server is already ready, otherwise wait for it
        const checkReady = () => {
          if (serverReady) {
            resolve(child);
          } else {
            setTimeout(checkReady, 100);
          }
        };

        setTimeout(checkReady, 500);

        setTimeout(async () => {
          if (!serverReady) {
            await doltServerProcess.current?.kill();
            doltServerProcess.current = undefined;
            reject(new Error("Timed out waiting for Dolt server to be ready"));
          }
        }, 30000);
      }).catch(reject);
    });
  }

  async function removeDoltServer(connectionName: string) {
    try {
      if (doltServerProcess.current) {
        await doltServerProcess.current.kill();
        doltServerProcess.current = undefined;
      }

      const { errorMsg } = await removeDoltServerFolder(connectionName);
      if (errorMsg) {
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("removeDoltServer failed:", error);
      throw new Error(getErrorMessage(error));
    }
  }

  async function cloneDoltDatabase(
    owner: string,
    remoteDatabase: string,
    newDbName: string,
    connectionName: string,
    port: string,
  ) {
    try {
      if (doltServerProcess.current) {
        await doltServerProcess.current.kill();
      }
      await cloneAndStartDatabase(
        owner,
        remoteDatabase,
        newDbName,
        connectionName,
        port
      );

      return "success";
    } catch (cloneError) {
      if (doltServerProcess.current) {
        await doltServerProcess.current.kill();
        doltServerProcess.current = undefined;
      }

      try {
        const { errorMsg } = await removeDoltServerFolder(connectionName);
        if (errorMsg) {
          console.error("Cleanup failed: ", errorMsg);
        }
      } catch (cleanupError) {
        console.error("Folder deletion error: ", cleanupError);
      }
      console.error(`Failed to clone database ${owner}/${remoteDatabase}: ${getErrorMessage(cloneError)}`);
      return new Error(getErrorMessage(cloneError));
    }
  }

  async function cloneAndStartDatabase(
    owner: string,
    remoteDatabase: string,
    newDbName: string,
    connectionName: string,
    port: string
  ): Promise<Child | undefined> {

    const dbFolderPath = await getConnectionsPath();
    const connectionFolderPath = await join(dbFolderPath, connectionName);

    try {
      await createFolder(connectionFolderPath);
      await cloneDatabase(
        owner,
        remoteDatabase,
        newDbName,
        connectionFolderPath,
      )
      return await startServerProcess(connectionFolderPath, port);

    } catch (error) {
      console.error("Failed to clone database: ", error);
      throw error;
    }
  }

  async function cloneDatabase(
    owner: string,
    remoteDatabase: string,
    newDbName: string,
    connectionFolderPath: string
  ): Promise<void> {
    const command = Command.sidecar('binaries/dolt', [
      "clone",
      `${owner}/${remoteDatabase}`,
      `${newDbName}`,
    ], { cwd: connectionFolderPath });

    const output = await command.execute();
    if (output.code !== 0) {
      const errorDetails = output.stderr || output.stdout || "Unknown error";
      const cloneErr = `Clone failed: ${errorDetails}`;
      console.error(cloneErr);
      throw new Error(cloneErr);
    }

    if (output.stderr) {
      console.log(output.stderr);
    }

    console.log(output.stdout);
  }

  return { startDoltServer, removeDoltServer, cloneDoltDatabase, doltServerProcess };

}
