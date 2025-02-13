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
  startDoltServer: (connectionName: string, port: string, init?: boolean) =>
    ipcRenderer.send("start-dolt-server", connectionName, port, init),
  removeDoltConnection: (connectionName: string) =>
    ipcRenderer.send("remove-dolt-connection", connectionName),
  getDoltServerError: (callback: (value: string) => {}) =>
    ipcRenderer.on("server-error", (_event, value) => callback(value)),
};

contextBridge.exposeInMainWorld("ipc", handler);

export type IpcHandler = typeof handler;
