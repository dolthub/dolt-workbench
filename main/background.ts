import path from "path";
import { app, ipcMain } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import { startGraphQLServer, stopGraphQLServer } from "./startGraphQLServer";

const isProd = process.env.NODE_ENV === "production";
const userDataPath = app.getPath("userData");
const schemaPath = path.join(userDataPath, "schema.gql");
process.env.SCHEMA_PATH = schemaPath;
process.env.NEXT_PUBLIC_FOR_ELECTRON = "true";

startGraphQLServer();

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
  await app.whenReady();

  const mainWindow = createWindow("main", {
    width: 1280,
    height: 680,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  if (isProd) {
    setTimeout(async () => {
      await mainWindow.loadURL("app://./");
            mainWindow.webContents.openDevTools();

    }, 3000);
  } else {
    setTimeout(async () => {
      const port = process.argv[2];
      await mainWindow.loadURL(`http://localhost:${port}`);
      mainWindow.webContents.openDevTools();
    }, 2500);
  }
})();

app.on("window-all-closed", () => {
  stopGraphQLServer();
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
