import { contextBridge, ipcRenderer } from "electron";

export type McpServerConfig = {
  host: string;
  port: number;
  user: string;
  database: string;
};

const handler = {
  async invoke(channel: string, ...args: unknown[]) {
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
    remoteDatabase: string,
    newDbName: string,
    connectionName: string,
    port: string,
  ) =>
    ipcRenderer.send(
      "clone-dolthub-db",
      owner,
      remoteDatabase,
      newDbName,
      connectionName,
      port,
    ),
  startDoltServer: (connectionName: string, port: string, init?: boolean) =>
    ipcRenderer.send("start-dolt-server", connectionName, port, init),
  removeDoltConnection: (connectionName: string) =>
    ipcRenderer.send("remove-dolt-connection", connectionName),
  getDoltServerError: (callback: (value: string) => {}) =>
    ipcRenderer.on("server-error", (_event, value) => callback(value)),
  doltLogin: async (connectionName: string) =>
    ipcRenderer.invoke("dolt-login", connectionName),
  cancelDoltLogin: (requestId: string) =>
    ipcRenderer.send("cancel-dolt-login", requestId),
  onLoginStarted: (callback: (requestId: string) => void) => {
    ipcRenderer.on("login-started", (_event, requestId) => callback(requestId));
  },
  startMcpServer: (config: McpServerConfig) =>
    ipcRenderer.send("start-mcp-server", config),
  stopMcpServer: () => ipcRenderer.send("stop-mcp-server"),
  onMcpServerError: (callback: (value: string) => void) =>
    ipcRenderer.on("mcp-server-error", (_event, value) => callback(value)),
  onMcpServerLog: (callback: (value: string) => void) =>
    ipcRenderer.on("mcp-server-log", (_event, value) => callback(value)),
  onMcpServerExit: (
    callback: (value: { code: number | null; signal: string | null }) => void,
  ) => ipcRenderer.on("mcp-server-exit", (_event, value) => callback(value)),
};

contextBridge.exposeInMainWorld("ipc", handler);

export type IpcHandler = typeof handler;
