import { getName } from "@tauri-apps/api/app";
import { join, homeDir, appDataDir } from "@tauri-apps/api/path";
import * as path from "node:path";


const isProd = process.env.NODE_ENV === "production";

export async function getConnectionsPath() {
  if (isProd) {
    const linuxDbRoot =
      process.platform === "linux"
        ? await join(await homeDir(), ".local", "share", await getName())
        : await appDataDir();

    return await join(linuxDbRoot, "connections");
  }
  return path.join(__dirname, "..", "..", "..", "build", "connections");
}
