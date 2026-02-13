import {
  createSdkMcpServer,
  PermissionResult,
  query,
  tool,
} from "@anthropic-ai/claude-agent-sdk";
import type { Query } from "@anthropic-ai/claude-agent-sdk";
import { execSync } from "child_process";
import { BrowserWindow, ipcMain } from "electron";
import { z } from "zod";
import { getClaudeCliPaths, getMcpServerPath } from "../helpers/filePath";
import {
  AgentConfig,
  ContentBlock,
  McpServerStatus,
  ToolResultEvent,
} from "./types";

function getSystemPrompt(
  database: string,
  dbType?: string,
  isDolt?: boolean,
): string {
  const typeInfo = dbType
    ? `The database type is ${isDolt ? "Dolt" : dbType}.`
    : "";
  return `You are a helpful database assistant for a database workbench application. You have access to tools that allow you to interact with Dolt, MySQL, and Postgres databases.

If interacting with a Dolt database, use Dolt MCP tools. For MySQL and Postgres, use 'mysql' and 'psql' CLI tools in Bash.

You are currently connected to the database: "${database}". ${typeInfo}

When users ask questions about their database, use the available tools to:
- List tables and their schemas
- Execute SQL queries to retrieve data
- Explore database structure and relationships
- Help users understand their data

IMPORTANT:
- After performing any write operation (INSERT, UPDATE, DELETE, CREATE, DROP, ALTER queries) or making a tool call that performs a write operation (exec, merging branches, creating/deleting branches, resetting, committing, etc.), you MUST silently call the refresh_page tool to update the workbench UI with the latest data. Do NOT mention that you are refreshing the page or that you called this tool - just call it silently in the background. These refresh calls should happen after EVERY write operation. For example, if you decide to make two 'exec' calls and a 'delete_dolt_branch' call, the order of tool calls should be 'exec' -> 'refresh_page' -> 'exec' -> 'refresh_page' -> 'delete_dolt_branch' -> 'refresh_page'.
- If the user asks you to create or modify the README.md, LICENSE.md, or AGENT.md, use the 'dolt_docs' system table.

Always be helpful and explain what you're doing. Do not use emojis in your responses.

When presenting query results, format them in a readable way. For large result sets, summarize the key findings.`;
}

const TOOLS_REQUIRING_CONFIRMATION = [
  "mcp__dolt__create_dolt_commit",
  "mcp__dolt__delete_dolt_branch",
  "mcp__dolt__move_dolt_branch",
  "mcp__dolt__dolt_reset_hard",
];

// Cache the user's shell PATH (fetched once at startup)
let cachedShellPath: string | null = null;

function getUserShellPath(): string | null {
  if (cachedShellPath !== null) {
    return cachedShellPath;
  }

  if (process.platform !== "darwin" && process.platform !== "linux") {
    return null;
  }

  try {
    const shell = process.env.SHELL ?? "/bin/zsh";
    cachedShellPath = execSync(`${shell} -ilc 'echo $PATH'`, {
      encoding: "utf-8",
      timeout: 5000,
    }).trim();
    console.log("Got user shell PATH:", cachedShellPath);
    return cachedShellPath;
  } catch (err) {
    console.error("Failed to get user shell PATH:", err);
    return null;
  }
}

// Get environment with the user's actual shell PATH
function getAgentEnv(): Record<string, string | undefined> {
  const env = { ...process.env };

  const shellPath = getUserShellPath();
  if (shellPath) {
    env.PATH = shellPath;
  }

  return env;
}

export class ClaudeAgent {
  private mainWindow: BrowserWindow;
  private config: AgentConfig;
  private sessionId: string | null = null;
  private queryHandle: Query | null = null;
  private isProcessing = false;
  private pendingConfirmation: {
    resolve: (result: PermissionResult) => void;
    toolName: string;
    input: Record<string, unknown>;
    toolUseId: string;
  } | null = null;

  // Track content blocks for the current turn
  private contentBlocks: ContentBlock[] = [];
  private toolCallMap = new Map<string, number>();

  constructor(config: AgentConfig, mainWindow: BrowserWindow) {
    this.config = config;
    this.mainWindow = mainWindow;
    this.setupConfirmationHandler();
  }

  private setupConfirmationHandler(): void {
    // Listen for confirmation responses from the renderer
    ipcMain.on(
      "agent:tool-confirmation-response",
      (_event, confirmed: boolean) => {
        if (this.pendingConfirmation) {
          const { resolve, toolName, input } = this.pendingConfirmation;
          this.pendingConfirmation = null;

          if (confirmed) {
            resolve({ behavior: "allow", updatedInput: input });
          } else {
            resolve({
              behavior: "deny",
              message: `The user rejected the "${toolName}" action. Ask the user why they rejected it and what they'd like you to do instead before continuing.`,
            });
          }
        }
      },
    );
  }

  private async canUseTool(
    toolName: string,
    input: Record<string, unknown>,
    options: { toolUseID: string },
  ): Promise<PermissionResult> {
    console.log(
      "canUseTool called with:",
      toolName,
      "toolUseID:",
      options.toolUseID,
    );

    if (!TOOLS_REQUIRING_CONFIRMATION.includes(toolName)) {
      return { behavior: "allow", updatedInput: input };
    }

    console.log("Sending confirmation request to renderer for:", toolName);

    // Send confirmation request inline with the tool call
    this.sendEvent("agent:tool-confirmation-request", {
      toolUseId: options.toolUseID,
      toolName,
      input,
    });

    return new Promise(resolve => {
      this.pendingConfirmation = {
        resolve,
        toolName,
        input,
        toolUseId: options.toolUseID,
      };
    });
  }

  // Create SDK MCP server with custom workbench tools
  private createWorkbenchMcpServer() {
    const switchBranchTool = tool(
      "switch_branch",
      "Switch to a different branch in the database workbench. This will navigate the UI to show the selected branch.",
      {
        branch_name: z.string().describe("The name of the branch to switch to"),
      },
      async args => {
        this.sendEvent("agent:switch-branch", { branchName: args.branch_name });
        return {
          content: [
            {
              type: "text" as const,
              text: `Successfully switched to branch: ${args.branch_name}`,
            },
          ],
        };
      },
    );

    const refreshPageTool = tool(
      "refresh_page",
      "Refresh the workbench UI to show the latest data. Call this after any write operation (INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, merge, commit, reset, branch creation/deletion, etc.) to ensure the UI displays the current state of the database.",
      {},
      async () => {
        // Send event to renderer to refresh the page
        this.sendEvent("agent:refresh-page", {});
        return {
          content: [
            {
              type: "text" as const,
              text: "Page refresh triggered. The workbench UI will now show the latest data.",
            },
          ],
        };
      },
    );

    return createSdkMcpServer({
      name: "workbench",
      version: "1.0.0",
      tools: [switchBranchTool, refreshPageTool],
    });
  }

  cleanup(): void {
    ipcMain.removeAllListeners("agent:tool-confirmation-response");
  }

  setModel(model: string): void {
    this.config.model = model;
  }

  private sendEvent(channel: string, data: unknown): void {
    if (!this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, data);
    }
  }

  private getMcpServerArgs(): string[] {
    const { mcpConfig } = this.config;
    console.log("MCP CONFIG: ", mcpConfig);
    const args = [
      "--stdio",
      "--dolt-host",
      mcpConfig.host,
      "--dolt-port",
      String(mcpConfig.port),
      "--dolt-user",
      mcpConfig.user,
      "--dolt-database",
      mcpConfig.database,
      "--dolt-password",
      mcpConfig.password ?? "",
    ];

    if (mcpConfig.useSSL) {
      args.push("--dolt-tls", "skip-verify");
    }

    return args;
  }

  private startQuery(userMessage: string, preserveContent = false): void {
    if (!preserveContent) {
      this.contentBlocks = [];
      this.toolCallMap.clear();
    }
    this.isProcessing = true;

    const mcpServerPath = getMcpServerPath();
    const mcpArgs = this.getMcpServerArgs();

    console.log("MCP server:", mcpServerPath);
    console.log("MCP args:", mcpArgs);

    const { mcpConfig } = this.config;
    const systemPrompt = getSystemPrompt(
      mcpConfig.database,
      mcpConfig.type,
      mcpConfig.isDolt,
    );

    const workbenchMcpServer = this.createWorkbenchMcpServer();

    const queryOptions: Parameters<typeof query>[0] = {
      prompt: userMessage,
      options: {
        model: this.config.model,
        systemPrompt,
        pathToClaudeCodeExecutable: getClaudeCliPaths(),
        env: { ...getAgentEnv(), ANTHROPIC_API_KEY: this.config.apiKey },
        mcpServers: {
          dolt: {
            command: mcpServerPath,
            args: mcpArgs,
          },
          workbench: workbenchMcpServer,
        },
        permissionMode: "default",
        canUseTool: async (toolName, input, options) =>
          this.canUseTool(toolName, input, { toolUseID: options.toolUseID }),
      },
    };

    // Resume session if we have one
    if (this.sessionId) {
      queryOptions.options = {
        ...queryOptions.options,
        resume: this.sessionId,
      };
    }

    this.queryHandle = query(queryOptions);

    // Fire and forget - processEvents runs in background
    void this.processEvents(this.queryHandle);
  }

  private async processEvents(handle: Query): Promise<void> {
    try {
      for await (const message of handle) {
        // If a newer query started, stop processing stale events
        if (this.queryHandle !== handle) return;

        // Handle system init message - capture session ID and MCP status
        if (message.type === "system" && message.subtype === "init") {
          this.sessionId = message.session_id;
          const mcpServersStatus: McpServerStatus[] = message.mcp_servers.map(
            (server: { name: string; status: string; error?: string }) => {
              return {
                name: server.name,
                status: server.status as "connected" | "failed",
                error: server.error,
              };
            },
          );

          // Check for MCP connection failures
          const failedServers = mcpServersStatus.filter(
            s => s.status === "failed",
          );
          if (failedServers.length > 0) {
            const errors = failedServers
              .map(s => `${s.name}: ${s.error ?? "Unknown error"}`)
              .join(", ");
            this.sendEvent("agent:error", {
              error: `MCP server connection failed: ${errors}`,
            });
            return;
          }
          continue;
        }

        // Content blocks arrive in order - we preserve this order
        if (message.type === "assistant") {
          const apiMessage = message.message;
          if (apiMessage?.content) {
            for (const block of apiMessage.content) {
              if (block.type === "text") {
                const textBlock: ContentBlock = {
                  type: "text",
                  text: block.text,
                };
                this.contentBlocks.push(textBlock);
                this.sendEvent("agent:content-block", textBlock);
              } else if (block.type === "tool_use") {
                const toolBlock: ContentBlock = {
                  type: "tool_use",
                  id: block.id,
                  name: block.name,
                  input: block.input as Record<string, unknown>,
                };
                this.toolCallMap.set(block.id, this.contentBlocks.length);
                this.contentBlocks.push(toolBlock);
                this.sendEvent("agent:content-block", toolBlock);
              }
            }
          }
        }

        // Handle tool results (user messages contain tool_result blocks)
        if (message.type === "user") {
          const apiMessage = message.message;
          const contentArray = apiMessage?.content;
          if (Array.isArray(contentArray)) {
            for (const block of contentArray) {
              if (
                typeof block === "object" &&
                block !== null &&
                "type" in block &&
                block.type === "tool_result"
              ) {
                const toolResultBlock = block as {
                  type: "tool_result";
                  tool_use_id: string;
                  content?: unknown;
                  is_error?: boolean;
                };

                // Update the corresponding tool_use block with the result
                const blockIndex = this.toolCallMap.get(
                  toolResultBlock.tool_use_id,
                );
                if (blockIndex !== undefined) {
                  const toolBlock = this.contentBlocks[blockIndex];
                  if (toolBlock.type === "tool_use") {
                    toolBlock.result = toolResultBlock.content;
                    toolBlock.isError = toolResultBlock.is_error;
                  }
                }

                // Send tool result event with the tool ID so renderer can update
                const toolBlock = this.contentBlocks[blockIndex ?? -1] as
                  | { name?: string }
                  | undefined;
                const resultEvent: ToolResultEvent = {
                  id: toolResultBlock.tool_use_id,
                  name: toolBlock?.name ?? "unknown",
                  result: toolResultBlock.content,
                  isError: toolResultBlock.is_error,
                };
                this.sendEvent("agent:tool-result", resultEvent);
              }
            }
          }
        }

        if (message.type === "result") {
          if (message.subtype === "success") {
            this.sendEvent("agent:message-complete", {
              contentBlocks: this.contentBlocks,
            });
          } else {
            // Error subtypes have 'errors' array
            const errorResult = message as { errors?: string[] };
            const errorMsg =
              errorResult.errors?.join(", ") ?? "Agent execution failed";
            this.sendEvent("agent:error", { error: errorMsg });
          }
        }
      }
    } catch (error) {
      // Ignore errors from stale/interrupted queries
      if (this.queryHandle !== handle) return;

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Claude Agent error:", error);
      this.sendEvent("agent:error", { error: errorMessage });
    } finally {
      // Only clean up state if this is still the active query
      if (this.queryHandle === handle) {
        this.queryHandle = null;
        this.isProcessing = false;
      }
    }
  }

  sendMessage(userMessage: string): void {
    if (this.isProcessing) {
      // Deny any pending tool confirmation
      if (this.pendingConfirmation) {
        const { resolve, toolName } = this.pendingConfirmation;
        this.pendingConfirmation = null;
        resolve({
          behavior: "deny",
          message: `Interrupted: User declined to execute ${toolName}`,
        });
      }

      // Close the current query to stop it
      this.queryHandle?.close();
      this.queryHandle = null;
      this.isProcessing = false;
      this.sendEvent("agent:interrupted", {});
    }

    // Start a fresh query for this message (with resume if we have a session)
    this.startQuery(userMessage);
  }

  cancelToolCall(toolName: string): void {
    if (!this.isProcessing) return;

    // Deny any pending tool confirmation
    if (this.pendingConfirmation) {
      const { resolve, toolName: pendingName } = this.pendingConfirmation;
      this.pendingConfirmation = null;
      resolve({
        behavior: "deny",
        message: `Cancelled: ${pendingName}`,
      });
    }

    // Mark the tool as cancelled in our content blocks
    for (const block of this.contentBlocks) {
      if (
        block.type === "tool_use" &&
        block.name === toolName &&
        !block.result
      ) {
        block.result = "Cancelled by user";
        block.isError = true;
      }
    }

    // Close the current query
    this.queryHandle?.close();
    this.queryHandle = null;
    this.isProcessing = false;
    this.sendEvent("agent:interrupted", {});

    // Resume with a message informing the agent about the cancellation, preserving existing content
    this.startQuery(
      `The user cancelled the execution of the "${toolName}" tool. It did not return a result. Please continue without it.`,
      true,
    );
  }

  abort(): void {
    this.queryHandle?.close();
    this.queryHandle = null;
    this.isProcessing = false;
    this.contentBlocks = [];
    this.toolCallMap.clear();
  }

  clearHistory(): void {
    this.abort();
    this.sessionId = null;
  }
}
