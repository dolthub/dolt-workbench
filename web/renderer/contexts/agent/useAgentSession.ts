import { useSetState } from "@dolthub/react-hooks";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AgentConfig,
  AgentMessage,
  ContentBlock,
  McpServerConfig,
  ToolResultEvent,
} from "./types";

function getDbIdentifier(config: McpServerConfig | null): string | null {
  if (!config) return null;
  return `${config.host}:${config.port}/${config.database}@${config.user}`;
}

type ConnectionState = {
  isConnected: boolean;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
};

const defaultConnectionState: ConnectionState = {
  isConnected: false,
  isLoading: false,
  isStreaming: false,
  error: null,
};

export type AgentSessionState = ConnectionState & {
  mcpConfig: McpServerConfig | null;
  setMcpConfig: (config: McpServerConfig | null) => void;
  messages: AgentMessage[];
  confirmToolCall: (toolUseId: string) => void;
  denyToolCall: (toolUseId: string) => void;
  cancelToolCall: (toolUseId: string, toolName: string) => void;
  connect: (apiKey: string, config: McpServerConfig) => Promise<boolean>;
  sendMessage: (message: string) => Promise<void>;
  disconnect: () => Promise<void>;
  clearHistory: () => Promise<void>;
  clearError: () => void;
};

export function useAgentSession(): AgentSessionState {
  const [mcpConfig, setMcpConfig] = useState<McpServerConfig | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [connState, setConnState] = useSetState<ConnectionState>(
    defaultConnectionState,
  );

  const lastValidDbRef = useRef<string | null>(null);

  // Reset agent state when database connection changes
  useEffect(() => {
    const currentDbId = getDbIdentifier(mcpConfig);
    const lastDbId = lastValidDbRef.current;

    if (currentDbId !== null) {
      if (lastDbId !== null && lastDbId !== currentDbId) {
        setMessages([]);
        setConnState(defaultConnectionState);

        if (typeof window !== "undefined" && window.ipc) {
          void window.ipc.agentDisconnect();
        }
      }
      lastValidDbRef.current = currentDbId;
    }
  }, [mcpConfig, setConnState]);

  // Set up IPC event listeners
  useEffect(() => {
    if (typeof window === "undefined" || !window.ipc) return;

    window.ipc.onAgentContentBlock((block: ContentBlock) => {
      setMessages(prev => {
        if (prev.length === 0) return prev;
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.role === "assistant") {
          return [
            ...prev.slice(0, -1),
            {
              ...lastMessage,
              contentBlocks: [...lastMessage.contentBlocks, block],
            },
          ];
        }
        return prev;
      });
    });

    window.ipc.onAgentToolResult((event: ToolResultEvent) => {
      setMessages(prev => {
        if (prev.length === 0) return prev;
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.role === "assistant") {
          const updatedBlocks = lastMessage.contentBlocks.map(block => {
            if (block.type === "tool_use" && block.id === event.id) {
              return { ...block, result: event.result, isError: event.isError };
            }
            return block;
          });
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, contentBlocks: updatedBlocks },
          ];
        }
        return prev;
      });
    });

    window.ipc.onAgentMessageComplete(
      (event: { contentBlocks: ContentBlock[] }) => {
        setMessages(prev => {
          if (prev.length === 0) return prev;
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                contentBlocks: event.contentBlocks,
                isStreaming: false,
              },
            ];
          }
          return prev;
        });
        setConnState({ isStreaming: false, isLoading: false });
      },
    );

    window.ipc.onAgentError((event: { error: string }) => {
      setConnState({
        error: event.error,
        isStreaming: false,
        isLoading: false,
      });
    });

    window.ipc.onAgentToolConfirmationRequest(
      (event: { toolUseId: string }) => {
        setMessages(prev =>
          prev.map(msg => {
            if (msg.role !== "assistant") return msg;
            const updatedBlocks = msg.contentBlocks.map(block => {
              if (block.type === "tool_use" && block.id === event.toolUseId) {
                return { ...block, pendingConfirmation: true };
              }
              return block;
            });
            return { ...msg, contentBlocks: updatedBlocks };
          }),
        );
      },
    );

    window.ipc.onAgentSwitchBranch((event: { branchName: string }) => {
      window.dispatchEvent(
        new CustomEvent("agent-switch-branch", { detail: event.branchName }),
      );
    });

    window.ipc.onAgentRefreshPage(() => {
      window.dispatchEvent(new CustomEvent("agent-refresh-page"));
    });

    window.ipc.onAgentInterrupted(() => {
      // Dismiss any pending tool confirmations on interrupted messages
      setMessages(prev =>
        prev.map(msg => {
          if (msg.role !== "assistant") return msg;
          const hasConfirmation = msg.contentBlocks.some(
            block => block.type === "tool_use" && block.pendingConfirmation,
          );
          if (!hasConfirmation) return msg;
          const updatedBlocks = msg.contentBlocks.map(block => {
            if (block.type === "tool_use" && block.pendingConfirmation) {
              return {
                ...block,
                pendingConfirmation: false,
                isError: true,
                result: "Interrupted by new message",
              };
            }
            return block;
          });
          return { ...msg, contentBlocks: updatedBlocks };
        }),
      );
    });

    return () => window.ipc?.removeAgentListeners?.();
  }, [setConnState]);

  const connect = useCallback(
    async (apiKey: string, config: McpServerConfig): Promise<boolean> => {
      if (typeof window === "undefined" || !window.ipc) {
        setConnState({ error: "Not running in Electron environment" });
        return false;
      }

      setConnState({ isLoading: true, error: null });

      try {
        const agentConfig: AgentConfig = { apiKey, mcpConfig: config };
        const result = await window.ipc.agentConnect(agentConfig);

        if (result.success) {
          setConnState({ isConnected: true, isLoading: false });
          return true;
        }
        setConnState({
          error: result.error ?? "Failed to connect",
          isLoading: false,
        });
        return false;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Connection failed";
        setConnState({ error: errorMessage, isLoading: false });
        return false;
      }
    },
    [setConnState],
  );

  const sendMessage = useCallback(
    async (message: string): Promise<void> => {
      if (typeof window === "undefined" || !window.ipc) {
        setConnState({ error: "Not running in Electron environment" });
        return;
      }

      setConnState({ isStreaming: true, error: null });

      const timestamp = Date.now();
      const userMessage: AgentMessage = {
        id: `user-${timestamp}`,
        role: "user",
        contentBlocks: [{ type: "text", text: message }],
        timestamp,
      };

      const assistantMessage: AgentMessage = {
        id: `assistant-${timestamp}`,
        role: "assistant",
        contentBlocks: [],
        isStreaming: true,
        timestamp,
      };

      // If last message is a streaming assistant (interrupt), mark it as done
      setMessages(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          const lastMsg = updated[updated.length - 1];
          if (lastMsg.role === "assistant" && lastMsg.isStreaming) {
            updated[updated.length - 1] = { ...lastMsg, isStreaming: false };
          }
        }
        return [...updated, userMessage, assistantMessage];
      });

      try {
        const result = await window.ipc.agentSendMessage(message);

        if (!result.success) {
          setConnState({
            error: result.error ?? "Failed to send message",
            isStreaming: false,
          });
          // Remove the empty assistant message on failure
          setMessages(prev => prev.slice(0, -1));
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send message";
        setConnState({
          error: errorMessage,
          isStreaming: false,
        });
        // Remove the empty assistant message on failure
        setMessages(prev => prev.slice(0, -1));
      }
    },
    [setConnState],
  );

  const disconnect = useCallback(async (): Promise<void> => {
    if (typeof window === "undefined" || !window.ipc) return;

    try {
      await window.ipc.agentDisconnect();
      setConnState({ isConnected: false, error: null });
      setMessages([]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Disconnect failed";
      setConnState({ error: errorMessage });
    }
  }, [setConnState]);

  const clearHistory = useCallback(async (): Promise<void> => {
    if (typeof window === "undefined" || !window.ipc) return;

    try {
      await window.ipc.agentClearHistory();
      setMessages([]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to clear history";
      setConnState({ error: errorMessage });
    }
  }, [setConnState]);

  const clearError = useCallback(
    () => setConnState({ error: null }),
    [setConnState],
  );

  const confirmToolCall = useCallback((toolUseId: string) => {
    if (typeof window === "undefined" || !window.ipc) return;
    window.ipc.agentToolConfirmationResponse(true);
    setMessages(prev =>
      prev.map(msg => {
        if (msg.role !== "assistant") return msg;
        const updatedBlocks = msg.contentBlocks.map(block => {
          if (block.type === "tool_use" && block.id === toolUseId) {
            return { ...block, pendingConfirmation: false };
          }
          return block;
        });
        return { ...msg, contentBlocks: updatedBlocks };
      }),
    );
  }, []);

  const denyToolCall = useCallback((toolUseId: string) => {
    if (typeof window === "undefined" || !window.ipc) return;
    window.ipc.agentToolConfirmationResponse(false);
    setMessages(prev =>
      prev.map(msg => {
        if (msg.role !== "assistant") return msg;
        const updatedBlocks = msg.contentBlocks.map(block => {
          if (block.type === "tool_use" && block.id === toolUseId) {
            return {
              ...block,
              pendingConfirmation: false,
              isError: true,
              result: "User declined to execute this action",
            };
          }
          return block;
        });
        return { ...msg, contentBlocks: updatedBlocks };
      }),
    );
  }, []);

  const cancelToolCall = useCallback((toolUseId: string, toolName: string) => {
    if (typeof window === "undefined" || !window.ipc) return;

    // Mark the tool as cancelled in the UI, keep the same message streaming
    setMessages(prev =>
      prev.map(msg => {
        if (msg.role !== "assistant") return msg;
        const updatedBlocks = msg.contentBlocks.map(block => {
          if (block.type === "tool_use" && block.id === toolUseId) {
            return { ...block, result: "Cancelled by user", isError: true };
          }
          return block;
        });
        return { ...msg, contentBlocks: updatedBlocks };
      }),
    );

    void window.ipc.agentCancelTool(toolName);
  }, []);

  return {
    mcpConfig,
    setMcpConfig,
    messages,
    isConnected: connState.isConnected,
    isLoading: connState.isLoading,
    isStreaming: connState.isStreaming,
    error: connState.error,
    confirmToolCall,
    denyToolCall,
    cancelToolCall,
    connect,
    sendMessage,
    disconnect,
    clearHistory,
    clearError,
  };
}
