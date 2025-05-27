import path from "path";
import { BrowserWindow, IpcMainInvokeEvent } from "electron";
import { ChildProcess, execFile } from "child_process";
import { v4 as randomUUID } from "uuid";
import { getDatabasesPath, getDoltPaths } from "./filePath";

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
