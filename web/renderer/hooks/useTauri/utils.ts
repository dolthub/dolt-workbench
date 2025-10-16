import { defaultWindowIcon, getName, getVersion } from "@tauri-apps/api/app";
import { join, homeDir, appDataDir } from "@tauri-apps/api/path";
import { mkdir, remove, exists } from "@tauri-apps/plugin-fs";
import { Menu, MenuItem, PredefinedMenuItem, Submenu } from "@tauri-apps/api/menu";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { emit } from "@tauri-apps/api/event";
import { openUrl } from "@tauri-apps/plugin-opener";
import { docsLink, workbenchGithubRepo } from "@lib/constants";
import { NextRouter } from "next/router";


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

export async function getMenu(hasChosenDatabase: boolean, router: NextRouter) {

  const icon = await defaultWindowIcon();
  const aboutSubmenu = await Submenu.new({
    text: "About",
    items: [
      await PredefinedMenuItem.new({
        item: {
          About: {
            name: "Dolt Workbench",
            version: await getVersion(),
            website: "https://dolthub.com",
            websiteLabel: "DoltHub",
            icon: icon ?? undefined,
          }
        }
      }),
      await PredefinedMenuItem.new({
        item: "Separator",
      }),
      await PredefinedMenuItem.new({
        item: "Services",
      }),
      await PredefinedMenuItem.new({
        item: "Separator",
      }),
      await PredefinedMenuItem.new({
        item: "Hide",
      }),
      await PredefinedMenuItem.new({
        item: "HideOthers",
      }),
      await PredefinedMenuItem.new({
        item: "ShowAll",
      }),
      await PredefinedMenuItem.new({
        item: "Separator",
      }),
      await PredefinedMenuItem.new({
        item: "Quit",
      })
    ]
  })

  const viewSubmenu = await Submenu.new({
    text: "View",
    items: [
      await MenuItem.new({
        id: "reload",
        text: "Reload",
        accelerator: "CmdOrCtrl+R",
        action: async () => {
          await router.push(router.asPath);
        }
      }),
      await PredefinedMenuItem.new({
        item: "Separator",
      }),
      await MenuItem.new({
        id: "reset-zoom",
        text: "Reset Zoom",
        action: async () => {
          await getCurrentWebview().setZoom(1);
        }
      }),
      await PredefinedMenuItem.new({
        item: "Separator",
      }),
      await PredefinedMenuItem.new({
        item: "Fullscreen",
      }),

    ]
  })

  const toolsSubmenu = await Submenu.new({
    text: "Tools",
    items: [
      await MenuItem.new({
        id: "import-file",
        text: "Import File",
        accelerator: "CmdOrCtrl+I",
        enabled: hasChosenDatabase,
        action: async () => {
          await emit("menu-clicked", {page: "upload-file"});
        }
      }),
      await PredefinedMenuItem.new({
        item: "Separator",
      }),
      await MenuItem.new({
        id: "commit-graph",
        text: "Commit Graph",
        accelerator: "CmdOrCtrl+G",
        enabled: hasChosenDatabase,
        action: async () => {
          await emit("menu-clicked", {page: "commit-graph"});
        }
      }),
      await PredefinedMenuItem.new({
        item: "Separator",
      }),
      await MenuItem.new({
        id: "schema-diagram",
        text: "Schema Diagram",
        accelerator: "CmdOrCtrl+D",
        enabled: hasChosenDatabase,
        action: async () => {
          await emit("menu-clicked", {page: "schema-diagram"});
        }
      }),
      await PredefinedMenuItem.new({
        item: "Separator",
      }),
      await Submenu.new({
        text: "New...",
        items: [
          await MenuItem.new({
            id: "new-table",
            text: "Table",
            accelerator: "Shift+CmdOrCtrl+T",
            enabled: hasChosenDatabase,
            action: async () => {
              await emit("menu-clicked", {page: "new-table"})
            }
          }),
          await PredefinedMenuItem.new({
            item: "Separator",
          }),
          await MenuItem.new({
            id: "new-branch",
            text: "Branch",
            accelerator: "Shift+CmdOrCtrl+B",
            enabled: hasChosenDatabase,
            action: async () => {
              await emit("menu-clicked", {page: "new-branch"})
            }
          }),
          await PredefinedMenuItem.new({
            item: "Separator",
          }),
          await MenuItem.new({
            id: "new-release",
            text: "Release",
            accelerator: "Shift+CmdOrCtrl+R",
            enabled: hasChosenDatabase,
            action: async () => {
              await emit("menu-clicked", {page: "new-release"})
            }
          }),
        ],
        enabled: hasChosenDatabase,
      }),
      await PredefinedMenuItem.new({
        item: "Separator",
      }),
      await MenuItem.new({
        id: "run-query",
        text: "Run Query",
        accelerator: "CmdOrCtrl+Q",
        enabled: hasChosenDatabase,
        action: async () => {
          await emit("menu-clicked", {page: "run-query"});
        }
      })
    ]
  });

  const editSubmenu =  await Submenu.new({
    text: "Edit",
    items: [
      await PredefinedMenuItem.new({
        item: "Cut",
      }),
      await PredefinedMenuItem.new({
        item: "Copy"
      }),
      await PredefinedMenuItem.new({
        item: "Paste"
      }),
      await PredefinedMenuItem.new({
        item: "SelectAll",
      }),
    ]
  })

  const windowSubmenu = await Submenu.new({
    text: "Window",
    items: [
      await PredefinedMenuItem.new({
        text: "Minimize",
        item: "Minimize",
      }),
      await PredefinedMenuItem.new({
        text: "Maximize",
        item: "Maximize",
      }),
    ]
  })

  const helpSubmenu = await Submenu.new({
    text: "Help",
    items: [
      await MenuItem.new({
        id: "documentation",
        text: "Documentation",
        action: async () => {
          await openUrl(docsLink);
        }
      }),
      await MenuItem.new({
        id: "github",
        text: "View on GitHub",
        action: async () => {
          await openUrl(workbenchGithubRepo);
        }
      })
    ]
  })

  return await Menu.new({
    items: [
      aboutSubmenu,
      editSubmenu,
      viewSubmenu,
      toolsSubmenu,
      windowSubmenu,
      helpSubmenu
    ],
  })

}
