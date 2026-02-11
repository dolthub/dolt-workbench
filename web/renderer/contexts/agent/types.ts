export type McpServerConfig = {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
  useSSL?: boolean;
  type?: string;
  isDolt?: boolean;
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

export type MessageRole = "user" | "assistant";

export type AgentMessage = {
  id: string;
  role: MessageRole;
  // Ordered content blocks (text and tool uses interleaved)
  contentBlocks: ContentBlock[];
  isStreaming?: boolean;
  timestamp: number;
};

export type AgentContextType = {
  // Panel visibility and size
  isPanelOpen: boolean;
  panelWidth: number;
  setPanelWidth: (width: number) => void;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;

  // Header state (for panel positioning)
  hasSmallHeader: boolean;
  setHasSmallHeader: (value: boolean) => void;

  // MCP config (from current database connection)
  mcpConfig: McpServerConfig | null;
  setMcpConfig: (config: McpServerConfig | null) => void;

  // Connection state
  messages: AgentMessage[];
  isConnected: boolean;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;

  // Tool confirmation (inline)
  confirmToolCall: (toolUseId: string) => void;
  denyToolCall: (toolUseId: string) => void;
  cancelToolCall: (toolUseId: string, toolName: string) => void;

  // Actions
  connect: (apiKey: string, mcpConfig: McpServerConfig) => Promise<boolean>;
  sendMessage: (message: string) => Promise<void>;
  disconnect: () => Promise<void>;
  clearHistory: () => Promise<void>;
  clearError: () => void;
};
