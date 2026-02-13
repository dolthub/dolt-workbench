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

export const MODELS = {
  SONNET: "claude-sonnet-4-5-20250929",
  OPUS: "claude-opus-4-6",
  HAIKU: "claude-haiku-4-5-20251001",
} as const;

export const MODEL_OPTIONS = [
  { label: "Sonnet 4.5", value: MODELS.SONNET },
  { label: "Opus 4.6", value: MODELS.OPUS },
  { label: "Haiku 4.5", value: MODELS.HAIKU },
];

export const DEFAULT_MODEL = MODELS.SONNET;

export type AgentConfig = {
  apiKey: string;
  mcpConfig: McpServerConfig;
  model: string;
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

  // Model selection
  selectedModel: string;
  setSelectedModel: (model: string) => void;

  // Actions
  connect: (apiKey: string, mcpConfig: McpServerConfig) => Promise<boolean>;
  sendMessage: (message: string) => Promise<void>;
  disconnect: () => Promise<void>;
  clearHistory: () => Promise<void>;
  clearError: () => void;
};
