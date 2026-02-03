import { contextBridge, ipcRenderer } from "electron";

export type McpServerConfig = {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
  useSSL?: boolean;
  type?: string; // DatabaseType: "Mysql" | "Postgres"
};

export type AgentConfig = {
  apiKey: string;
  mcpConfig: McpServerConfig;
};

export type ToolCallEvent = {
  id: string;
  name: string;
  input: Record<string, unknown>;
};

export type ToolResultEvent = {
  id: string;
  name: string;
  result: unknown;
  isError?: boolean;
};

// Content block types for ordered message content
export type TextContentBlock = {
  type: "text";
  text: string;
};

export type ToolUseContentBlock = {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
  result?: unknown;
  isError?: boolean;
  pendingConfirmation?: boolean;
};

export type ContentBlock = TextContentBlock | ToolUseContentBlock;

export type AgentMessageCompleteEvent = {
  contentBlocks: ContentBlock[];
};

export type AgentErrorEvent = {
  error: string;
};

export type ToolConfirmationRequest = {
  toolName: string;
  input: Record<string, unknown>;
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

  // Agent IPC methods
  agentConnect: async (config: AgentConfig) =>
    ipcRenderer.invoke("agent:connect", config),
  agentSendMessage: async (message: string) =>
    ipcRenderer.invoke("agent:send-message", message),
  agentDisconnect: async () => ipcRenderer.invoke("agent:disconnect"),
  agentClearHistory: async () => ipcRenderer.invoke("agent:clear-history"),
  agentAbort: async () => ipcRenderer.invoke("agent:abort"),

  // API Key storage
  agentGetApiKey: async (): Promise<string | null> =>
    ipcRenderer.invoke("agent:get-api-key"),
  agentStoreApiKey: async (apiKey: string): Promise<boolean> =>
    ipcRenderer.invoke("agent:store-api-key", apiKey),
  agentClearApiKey: async (): Promise<void> =>
    ipcRenderer.invoke("agent:clear-api-key"),

  // Agent event listeners
  onAgentContentBlock: (callback: (block: ContentBlock) => void) =>
    ipcRenderer.on("agent:content-block", (_event, value) => callback(value)),
  onAgentToolResult: (callback: (event: ToolResultEvent) => void) =>
    ipcRenderer.on("agent:tool-result", (_event, value) => callback(value)),
  onAgentMessageComplete: (
    callback: (event: AgentMessageCompleteEvent) => void,
  ) =>
    ipcRenderer.on("agent:message-complete", (_event, value) =>
      callback(value),
    ),
  onAgentError: (callback: (event: AgentErrorEvent) => void) =>
    ipcRenderer.on("agent:error", (_event, value) => callback(value)),
  onAgentToolConfirmationRequest: (
    callback: (event: {
      toolUseId: string;
      toolName: string;
      input: Record<string, unknown>;
    }) => void,
  ) =>
    ipcRenderer.on("agent:tool-confirmation-request", (_event, value) =>
      callback(value),
    ),

  // Send tool confirmation response
  agentToolConfirmationResponse: (confirmed: boolean) =>
    ipcRenderer.send("agent:tool-confirmation-response", confirmed),

  // Remove agent event listeners
  removeAgentListeners: () => {
    ipcRenderer.removeAllListeners("agent:content-block");
    ipcRenderer.removeAllListeners("agent:tool-result");
    ipcRenderer.removeAllListeners("agent:message-complete");
    ipcRenderer.removeAllListeners("agent:error");
    ipcRenderer.removeAllListeners("agent:tool-confirmation-request");
  },
};

contextBridge.exposeInMainWorld("ipc", handler);

export type IpcHandler = typeof handler;
