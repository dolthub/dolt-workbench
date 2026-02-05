export type McpServerConfig = {
  host: string;
  port: number;
  user: string;
  database: string;
  password?: string;
  useSSL?: boolean;
  type?: string; // DatabaseType: "Mysql" | "Postgres"
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
  contentBlocks: ContentBlock[];
  timestamp: number;
};

export type McpServerStatus = {
  name: string;
  status: "connected" | "failed";
  error?: string;
};
