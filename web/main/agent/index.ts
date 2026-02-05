export { registerAgentIpcHandlers, cleanupAgent } from "./ipcHandlers";
export { ClaudeAgent } from "./anthropicAgent";
export type {
  AgentConfig,
  McpServerConfig,
  ToolCallEvent,
  ToolResultEvent,
  AgentMessage,
} from "./types";
