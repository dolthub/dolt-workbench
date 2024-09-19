import path from "path";
import {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  utilityProcess,
  UtilityProcess,
} from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import { initMenu } from "./helpers/menu";

const isProd = process.env.NODE_ENV === "production";
const userDataPath = app.getPath("userData");
const schemaPath = isProd
  ? path.join(userDataPath, "schema.gql")
  : "graphql-server/schema.gql";
process.env.SCHEMA_PATH = schemaPath;
process.env.NEXT_PUBLIC_FOR_ELECTRON = "true";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

let serverProcess: UtilityProcess | null;
let mainWindow: BrowserWindow;

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
      : path.join("graphql-server", "dist", "main.js");
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

app.on("ready", () => {
  mainWindow = createWindow("main", {
    width: 1280,
    height: 680,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  Menu.setApplicationMenu(initMenu(mainWindow, isProd));
  createGraphqlSeverProcess();

  if (isProd) {
    setTimeout(async () => {
      await mainWindow.loadURL("app://./");
    }, 3000);
  } else {
    setTimeout(async () => {
      const port = process.argv[2];
      await mainWindow.loadURL(`http://localhost:${port}`);
    }, 2500);
  }
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
  // On macOS, closing all windows shouldn't exit the process
  if (process.platform !== "darwin") {
    app.quit();
  }
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
