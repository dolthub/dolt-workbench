import { contextBridge, ipcRenderer } from "electron";

const handler = {
  invoke(channel: string, ...args: unknown[]) {
    return ipcRenderer.invoke(channel, ...args);
  },
  onMenuClicked: (callback: (value: string) => {}) =>
    ipcRenderer.on("menu-clicked", (_event, value) => callback(value)),
  updateAppMenu: (databaseName?: string) => {
    ipcRenderer.send("update-menu", databaseName);
  },
  macTitlebarClicked() {
    ipcRenderer.send("mac-title-bar-clicked");
  },
  toggleLeftSidebar: (callback: () => {}) =>
    ipcRenderer.on("toggle-left-sidebar", _event => callback()),
  cloneDatabase: (
    owner: string,
    databaseName: string,
    connectionName: string,
    port: string,
  ) =>
    ipcRenderer.send(
      "clone-dolthub-db",
      owner,
      databaseName,
      connectionName,
      port,
    ),
  startDoltServer: (connectionName: string, port: string, init?: boolean) =>
    ipcRenderer.send("start-dolt-server", connectionName, port, init),
  removeDoltConnection: (connectionName: string) =>
    ipcRenderer.send("remove-dolt-connection", connectionName),
  getDoltServerError: (callback: (value: string) => {}) =>
    ipcRenderer.on("server-error", (_event, value) => callback(value)),
  doltLogin: (connectionName: string) =>
    ipcRenderer.invoke("dolt-login", connectionName),
  cancelDoltLogin: (requestId: string) =>
    ipcRenderer.send("cancel-dolt-login", requestId),
  onLoginStarted: (callback: (requestId: string) => void) => {
    ipcRenderer.on("login-started", (_event, requestId) => callback(requestId));
  },
};

contextBridge.exposeInMainWorld("ipc", handler);

export type IpcHandler = typeof handler;
