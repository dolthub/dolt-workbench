import { BrowserWindow, ipcMain } from "electron";
import { ClaudeAgent } from "./anthropicAgent";
import {
  clearStoredApiKey,
  getStoredApiKey,
  storeApiKey,
} from "./apiKeyStorage";
import { AgentConfig } from "./types";

let claudeAgent: ClaudeAgent | null = null;

export function registerAgentIpcHandlers(mainWindow: BrowserWindow): void {
  // API Key storage handlers
  ipcMain.handle(
    "agent:get-api-key",
    async (): Promise<string | null> => getStoredApiKey(),
  );

  ipcMain.handle(
    "agent:store-api-key",
    async (_, apiKey: string): Promise<boolean> => storeApiKey(apiKey),
  );

  ipcMain.handle("agent:clear-api-key", async (): Promise<void> => {
    clearStoredApiKey();
  });

  // Connect to agent with API key and MCP config
  ipcMain.handle(
    "agent:connect",
    async (
      _,
      config: AgentConfig,
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        // Clean up existing agent if any
        if (claudeAgent) {
          claudeAgent.cleanup();
          claudeAgent = null;
        }

        // Create Claude Agent (MCP server is spawned per-query by the SDK)
        claudeAgent = new ClaudeAgent(config, mainWindow);

        console.log("Agent initialized with config:", {
          host: config.mcpConfig.host,
          port: config.mcpConfig.port,
          user: config.mcpConfig.user,
          database: config.mcpConfig.database,
          hasPassword: !!config.mcpConfig.password,
        });

        return { success: true };
      } catch (error) {
        console.error("Agent initialization error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to initialize agent";

        claudeAgent = null;
        return { success: false, error: errorMessage };
      }
    },
  );

  // Send message to agent
  ipcMain.handle(
    "agent:send-message",
    async (
      _,
      message: string,
    ): Promise<{ success: boolean; error?: string }> => {
      if (!claudeAgent) {
        return { success: false, error: "Agent not connected" };
      }

      try {
        await claudeAgent.sendMessage(message);
        return { success: true };
      } catch (error) {
        console.error("Agent send message error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to send message";
        return { success: false, error: errorMessage };
      }
    },
  );

  // Disconnect agent
  ipcMain.handle(
    "agent:disconnect",
    async (): Promise<{ success: boolean; error?: string }> => {
      try {
        if (claudeAgent) {
          claudeAgent.abort();
          claudeAgent.cleanup();
          claudeAgent = null;
        }
        console.log("Agent disconnected");
        return { success: true };
      } catch (error) {
        console.error("Agent disconnect error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to disconnect agent";
        return { success: false, error: errorMessage };
      }
    },
  );

  // Clear conversation history
  ipcMain.handle(
    "agent:clear-history",
    async (): Promise<{ success: boolean; error?: string }> => {
      if (claudeAgent) {
        claudeAgent.clearHistory();
      }
      return { success: true };
    },
  );

  // Abort current operation
  ipcMain.handle(
    "agent:abort",
    async (): Promise<{ success: boolean; error?: string }> => {
      if (claudeAgent) {
        claudeAgent.abort();
      }
      return { success: true };
    },
  );
}

// Cleanup function to be called on app quit
export async function cleanupAgent(): Promise<void> {
  if (claudeAgent) {
    try {
      claudeAgent.abort();
      claudeAgent.cleanup();
    } catch (e) {
      console.error("Error during agent cleanup:", e);
    }
    claudeAgent = null;
  }
}
