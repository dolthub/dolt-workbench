import { getName } from "@tauri-apps/api/app";
import { join, homeDir, appDataDir } from "@tauri-apps/api/path";
import { mkdir } from "@tauri-apps/plugin-fs";


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
