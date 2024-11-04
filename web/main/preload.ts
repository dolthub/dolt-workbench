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
};

contextBridge.exposeInMainWorld("ipc", handler);

export type IpcHandler = typeof handler;
