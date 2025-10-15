import { getName } from "@tauri-apps/api/app";
import { join, homeDir, appDataDir } from "@tauri-apps/api/path";
import { mkdir, remove, exists } from "@tauri-apps/plugin-fs";


export async function getConnectionsPath() {
  const linuxDbRoot =
    process.platform === "linux"
      ? await join(await homeDir(), ".local", "share", await getName())
      : await appDataDir();

  return await join(linuxDbRoot, "connections");
}

export async function createFolder(folderPath: string): Promise<void> {
  try {
    await mkdir(folderPath, { recursive: true });
  } catch (error) {
    const errorMsg = `Failed to create folder: ${error}`;
    throw new Error(errorMsg);
  }
}

export async function getSocketPath(): Promise<string> {
  const appData = await appDataDir();
  return await join(appData, "dolt.sock");
}

export async function removeDoltServerFolder(
  connectionName: string,
  retries = 3,
): Promise<{ errorMsg?: string }> {
  const dbFolderPath = await join(await getConnectionsPath(), connectionName);
  
  console.log(`Attempting to remove folder: ${dbFolderPath}`);
  
  // Check if folder exists first
  const folderExists = await exists(dbFolderPath);
  console.log(`Folder exists: ${folderExists}`);
  
  if (!folderExists) {
    console.log("Folder doesn't exist, nothing to remove");
    return { errorMsg: undefined }; // Nothing to remove
  }
  
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1} to remove ${dbFolderPath}`);
      await remove(dbFolderPath, { recursive: true });
      
      // Verify deletion
      const stillExists = await exists(dbFolderPath);
      if (stillExists) {
        throw new Error("Folder still exists after removal attempt");
      }
      
      console.log(`Successfully removed folder: ${dbFolderPath}`);
      return { errorMsg: undefined };
    } catch (err) {
      console.error(`Attempt ${i + 1} to remove ${dbFolderPath} failed:`, err);
      if (i === retries - 1) {
        return { errorMsg: `Failed after ${retries} attempts: ${getErrorMessage(err)}` };
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
