import path from "path";
import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  shell,
  utilityProcess,
  UtilityProcess,
  IpcMainEvent,
  systemPreferences,
} from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import { initMenu } from "./helpers/menu";
import {
  doltLogin,
  cloneAndStartDatabase,
  getErrorMessage,
  removeDoltServerFolder,
  startServer,
} from "./doltServer";
import { ChildProcess } from "child_process";

const isProd = process.env.NODE_ENV === "production";
const userDataPath = app.getPath("userData");
const schemaPath = isProd
  ? path.join(userDataPath, "schema.gql")
  : "../graphql-server/schema.gql";
process.env.SCHEMA_PATH = schemaPath;
process.env.NEXT_PUBLIC_FOR_ELECTRON = "true";
process.env.NEXT_PUBLIC_USER_DATA_PATH = userDataPath;

const HEADER_HEIGHT = 48;
const MACOS_TRAFFIC_LIGHTS_HEIGHT = 16;

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

let graphqlServerProcess: UtilityProcess | null;
let mainWindow: BrowserWindow;
let doltServerProcess: ChildProcess | null;

function isExternalUrl(url: string) {
  return !url.includes("localhost:") && !url.includes("app://");
}

function createGraphqlSeverProcess() {
  const serverPath =
    process.env.NODE_ENV === "production"
      ? path.join(
          process.resourcesPath,
          "..",
          "graphql-server",
          "dist",
          "main.js",
        )
      : path.join("../graphql-server", "dist", "main.js");
  graphqlServerProcess = utilityProcess.fork(serverPath, [], { stdio: "pipe" });

  graphqlServerProcess?.stdout?.on("data", (chunk: Buffer) => {
    console.log("server data", chunk.toString("utf8"));
    // Send the Server console.log messages to the main browser window
    mainWindow?.webContents.executeJavaScript(`
        console.info('Server Log:', ${JSON.stringify(chunk.toString("utf8"))})`);
  });

  graphqlServerProcess?.stderr?.on("data", (chunk: Buffer) => {
    console.error("server error", chunk.toString("utf8"));
    // Send the Server console.error messages out to the main browser window
    mainWindow?.webContents.executeJavaScript(`
        console.error('Server Log:', ${JSON.stringify(chunk.toString("utf8"))})`);
  });
}

async function isGraphQLServerReady(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "{ __typename }" }),
    });
    return response.ok;
  } catch (error) {
    console.error("Error pinging GraphQL server:", error);
    return false;
  }
}

async function waitForGraphQLServer(
  url: string,
  timeout: number = 30000,
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const isReady = await isGraphQLServerReady(url);
    if (isReady) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error("Timed out starting GraphQL server");
}

function setupTitleBarClickMac() {
  if (process.platform !== "darwin") {
    return;
  }

  ipcMain.on("mac-title-bar-clicked", (event: IpcMainEvent) => {
    const doubleClickAction = systemPreferences.getUserDefault(
      "AppleActionOnDoubleClick",
      "string",
    );
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      if (doubleClickAction === "Minimize") {
        win.minimize();
      } else if (doubleClickAction === "Maximize") {
        if (!win.isMaximized()) {
          win.maximize();
        } else {
          win.unmaximize();
        }
      }
    }
  });
}

app.on("ready", async () => {
  mainWindow = createWindow("main", {
    width: 1400,
    height: 900,
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : undefined,
    titleBarOverlay:
      process.platform === "darwin" ? { height: HEADER_HEIGHT } : undefined,
    trafficLightPosition: {
      x: 20,
      y: HEADER_HEIGHT / 2 - MACOS_TRAFFIC_LIGHTS_HEIGHT / 2,
    },
    acceptFirstMouse: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  Menu.setApplicationMenu(initMenu(mainWindow, isProd));
  setupTitleBarClickMac();
  createGraphqlSeverProcess();

  await waitForGraphQLServer("http://localhost:9002/graphql");

  if (isProd) {
    await mainWindow.loadURL("app://./");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}`);
  }

  // hit when middle-clicking buttons or <a href/> with a target set to _blank
  // always deny, optionally redirect to browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isExternalUrl(url)) {
      shell.openExternal(url);
    }

    return { action: "deny" };
  });
  mainWindow.setMinimumSize(1080, 780);

  // hit when clicking <a href/> with no target
  // optionally redirect to browser
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (isExternalUrl(url)) {
      shell.openExternal(url);
      event.preventDefault();
    }
  });
});

function updateMenu(databaseName?: string) {
  const hasChosenDatabase = !!databaseName;
  const menu = initMenu(mainWindow, isProd, hasChosenDatabase);

  Menu.setApplicationMenu(menu);
}

ipcMain.on("update-menu", (_event, databaseName?: string) => {
  updateMenu(databaseName);
});

app.on("before-quit", () => {
  if (graphqlServerProcess) {
    graphqlServerProcess.kill();
    graphqlServerProcess = null;
  }
  if (doltServerProcess) {
    doltServerProcess.kill();
    doltServerProcess = null;
  }
});

app.on("window-all-closed", () => {
  app.quit();
});

// This does not work
// TODO: add a way to get headers
ipcMain.handle("get-headers", (event, arg) => {
  const headers = {
    ...arg,
  };
  return headers;
});

ipcMain.handle("api-config", async () => {
  const cfg = {
    graphqlApiUrl: process.env.GRAPHQLAPI_URL,
  };
  return cfg;
});

ipcMain.handle("toggle-left-sidebar", () => {
  mainWindow.webContents.send("toggle-left-sidebar");
});

ipcMain.handle(
  "start-dolt-server",
  async (_, connectionName: string, port: string, init?: boolean) => {
    try {
      console.log("start-dolt-server", connectionName, port, init);
      doltServerProcess = await startServer(
        mainWindow,
        connectionName,
        port,
        init,
      );
      if (!doltServerProcess) {
        throw new Error("Failed to start Dolt server");
      }
      return "success";
    } catch (error) {
      if (doltServerProcess) {
        doltServerProcess.kill();
        doltServerProcess = null;
      }
      if (init) {
        const dbFolderPath = isProd
          ? path.join(app.getPath("userData"), "databases", connectionName)
          : path.join(__dirname, "..", "build", "databases", connectionName);

        try {
          const { errorMsg } = await removeDoltServerFolder(
            dbFolderPath,
            mainWindow,
          );
          if (errorMsg) {
            console.error("Cleanup failed:", errorMsg);
            mainWindow.webContents.send(
              "server-error",
              `Cleanup failed: ${errorMsg}`,
            );
          }
        } catch (cleanupError) {
          console.error("Folder deletion error:", cleanupError);
          mainWindow.webContents.send(
            "server-error",
            `Failed to clean up files: ${getErrorMessage(cleanupError)}`,
          );
        }
      }
      return new Error(getErrorMessage(error));
    }
  },
);

ipcMain.handle("remove-dolt-connection", async (_, connectionName: string) => {
  try {
    // if doltServerProcess is running, kill it
    if (doltServerProcess) {
      doltServerProcess.kill("SIGTERM");
      // Wait for process to exit
      await new Promise(resolve => {
        doltServerProcess?.once("exit", resolve);
      });

      doltServerProcess = null;
    }
    // Delete folder with retries
    const dbFolderPath = isProd
      ? path.join(app.getPath("userData"), "databases", connectionName)
      : path.join(__dirname, "..", "build", "databases", connectionName);

    const { errorMsg } = await removeDoltServerFolder(dbFolderPath, mainWindow);
    if (errorMsg) throw new Error(errorMsg);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
});

ipcMain.handle("dolt-login", async (_, connectionName: string) => {
  try {
    const result = await doltLogin(connectionName, mainWindow);
    return { success: true, ...result };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
});

ipcMain.handle(
  "clone-dolthub-db",
  async (_, owner: string, databaseName: string, port: string) => {
    try {
      doltServerProcess = await cloneAndStartDatabase(
        owner,
        databaseName,
        port,
        mainWindow,
      );
      if (!doltServerProcess) {
        throw new Error("Failed to start Dolt server");
      }
      return "success";
    } catch (cloneError) {
      if (doltServerProcess) {
        doltServerProcess.kill();
        doltServerProcess = null;
      }

      mainWindow.webContents.send(
        "server-error",
        `Failed to clone database ${owner}/${databaseName}: ${getErrorMessage(cloneError)}`,
      );
      return new Error(getErrorMessage(cloneError));
    }
  },
);
