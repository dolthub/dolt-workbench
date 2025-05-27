import fs from "fs";
import path from "path";
import { BrowserWindow } from "electron";
import { rimraf } from "rimraf";
import { getDatabasesPath } from "./filePath";

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  } else if (typeof error === "string") {
    return error;
  } else {
    return "An unknown error occurred";
  }
}

type ErrorReturnType = {
  errorMsg?: string;
};

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
