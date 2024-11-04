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

const isProd = process.env.NODE_ENV === "production";
const userDataPath = app.getPath("userData");
const schemaPath = isProd
  ? path.join(userDataPath, "schema.gql")
  : "../graphql-server/schema.gql";
process.env.SCHEMA_PATH = schemaPath;
process.env.NEXT_PUBLIC_FOR_ELECTRON = "true";
process.env.NEXT_PUBLIC_USER_DATA_PATH = userDataPath;

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

let serverProcess: UtilityProcess | null;
let mainWindow: BrowserWindow;

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
  serverProcess = utilityProcess.fork(serverPath, [], { stdio: "pipe" });

  serverProcess?.stdout?.on("data", (chunk: Buffer) => {
    console.log("server data", chunk.toString("utf8"));
    // Send the Server console.log messages to the main browser window
    mainWindow?.webContents.executeJavaScript(`
        console.info('Server Log:', ${JSON.stringify(chunk.toString("utf8"))})`);
  });

  serverProcess?.stderr?.on("data", (chunk: Buffer) => {
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
    console.log("mac-title-bar-clicked");
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
  const HEADER_HEIGHT = 48;
  const MACOS_TRAFFIC_LIGHTS_HEIGHT = 16;
  mainWindow = createWindow("main", {
    width: 1280,
    height: 680,
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : undefined,
    titleBarOverlay: process.platform === "darwin",
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
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
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
