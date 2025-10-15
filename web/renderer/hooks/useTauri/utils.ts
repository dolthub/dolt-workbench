import { getName } from "@tauri-apps/api/app";
import { join, homeDir, appDataDir } from "@tauri-apps/api/path";


const isProd = process.env.NODE_ENV === "production";

export async function getConnectionsPath() {
  const linuxDbRoot =
    process.platform === "linux"
      ? await join(await homeDir(), ".local", "share", await getName())
      : await appDataDir();

  return await join(linuxDbRoot, "connections");
}

// Returns the path to the Dolt binary based on the platform and environment.
// For production, the binary is stored in the app's resources folder
// For dev, the binary is in the build/[platform] directory.
export async function getDoltPaths(): Promise<string> {
  if (isProd) {
    return "binaries/dolt";
  }
  if (process.platform === "darwin") {
      return await join(__dirname, "..", "build", "mac", "dolt");
  } else if (process.platform === "linux") {
      return await join(__dirname, "..", "build", "linux", "dolt");
  } else {
      return await join(__dirname, "..", "build", "appx", "dolt.exe");
  }
}
