import { createCustomContext } from "@dolthub/react-contexts";
import { useContextWithError } from "@dolthub/react-hooks";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AgentConfig,
  AgentContextType,
  AgentMessage,
  ContentBlock,
  McpServerConfig,
  ToolResultEvent,
} from "./types";

export const AgentContext =
  createCustomContext<AgentContextType>("AgentContext");

type Props = {
  children: ReactNode;
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const DEFAULT_PANEL_WIDTH = 420;

export function AgentProvider({ children }: Props) {
  // Panel visibility and size state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);

  // Header state (for panel positioning)
  const [hasSmallHeader, setHasSmallHeader] = useState(false);

  // MCP config state
  const [mcpConfig, setMcpConfig] = useState<McpServerConfig | null>(null);

  // Connection and message state
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_currentAssistantMessageId, setCurrentAssistantMessageId] = useState<
    string | null
  >(null);

  // Panel visibility actions
  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);
  const togglePanel = useCallback(() => setIsPanelOpen(prev => !prev), []);

  // Listen for toggle-agent-panel custom event (from menu or keyboard shortcut)
  useEffect(() => {
    const handleToggleEvent = () => togglePanel();
    window.addEventListener("toggle-agent-panel", handleToggleEvent);
    return () =>
      window.removeEventListener("toggle-agent-panel", handleToggleEvent);
  }, [togglePanel]);

  // Track the last valid database connection to detect actual changes
  // (ignoring temporary null states during tab switches)
  const lastValidDbRef = useRef<string | null>(null);

  // Create a stable database identifier string
  const getDbIdentifier = (config: McpServerConfig | null): string | null => {
    if (!config) return null;
    return `${config.host}:${config.port}/${config.database}@${config.user}`;
  };

  // Reset agent state only when database connection actually changes to a DIFFERENT database
  useEffect(() => {
    const currentDbId = getDbIdentifier(mcpConfig);
    const lastDbId = lastValidDbRef.current;

    // Only update lastValidDbRef when we have a valid config
    if (currentDbId !== null) {
      // If this is a different database than before, reset state
      if (lastDbId !== null && lastDbId !== currentDbId) {
        setMessages([]);
        setIsConnected(false);
        setIsLoading(false);
        setIsStreaming(false);
        setError(null);
        setCurrentAssistantMessageId(null);

        // Also disconnect from the backend if we have IPC
        if (typeof window !== "undefined" && window.ipc) {
          window.ipc.agentDisconnect().catch(() => {
            // Ignore errors during disconnect
          });
        }
      }
      lastValidDbRef.current = currentDbId;
    }
    // Note: We intentionally don't reset when mcpConfig goes null (tab switches)
    // or when it's the first connection (lastDbId is null)
  }, [mcpConfig]);

  // Set up IPC event listeners
  useEffect(() => {
    if (typeof window === "undefined" || !window.ipc) return;

    // Handle content blocks (text or tool_use) - these arrive in order
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

    // Handle tool results - update the corresponding tool_use block
    window.ipc.onAgentToolResult((event: ToolResultEvent) => {
      setMessages(prev => {
        if (prev.length === 0) return prev;
        const lastMessage = prev[prev.length - 1];
        if (lastMessage.role === "assistant") {
          const updatedBlocks = lastMessage.contentBlocks.map(block => {
            if (block.type === "tool_use" && block.id === event.id) {
              return {
                ...block,
                result: event.result,
                isError: event.isError,
              };
            }
            return block;
          });
          return [
            ...prev.slice(0, -1),
            {
              ...lastMessage,
              contentBlocks: updatedBlocks,
            },
          ];
        }
        return prev;
      });
    });

    // Handle message complete
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
        setIsStreaming(false);
        setIsLoading(false);
        setCurrentAssistantMessageId(null);
      },
    );

    // Handle errors
    window.ipc.onAgentError((event: { error: string }) => {
      setError(event.error);
      setIsStreaming(false);
      setIsLoading(false);
    });

    // Handle tool confirmation requests - update the tool block to show pending state
    window.ipc.onAgentToolConfirmationRequest(
      (event: {
        toolUseId: string;
        toolName: string;
        input: Record<string, unknown>;
      }) => {
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

    // Cleanup listeners on unmount
    return () => {
      if (window.ipc?.removeAgentListeners) {
        window.ipc.removeAgentListeners();
      }
    };
  }, []);

  const connect = useCallback(
    async (apiKey: string, config: McpServerConfig): Promise<boolean> => {
      if (typeof window === "undefined" || !window.ipc) {
        setError("Not running in Electron environment");
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        const agentConfig: AgentConfig = { apiKey, mcpConfig: config };
        const result = await window.ipc.agentConnect(agentConfig);

        if (result.success) {
          setIsConnected(true);
          setIsLoading(false);
          return true;
        }
        setError(result.error || "Failed to connect");
        setIsLoading(false);
        return false;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Connection failed";
        setError(errorMessage);
        setIsLoading(false);
        return false;
      }
    },
    [],
  );

  const sendMessage = useCallback(async (message: string): Promise<void> => {
    if (typeof window === "undefined" || !window.ipc) {
      setError("Not running in Electron environment");
      return;
    }

    setIsLoading(true);
    setIsStreaming(true);
    setError(null);

    // Add user message with text content block
    const userMessage: AgentMessage = {
      id: generateId(),
      role: "user",
      contentBlocks: [{ type: "text", text: message }],
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Create placeholder for assistant message
    const assistantMessageId = generateId();
    const assistantMessage: AgentMessage = {
      id: assistantMessageId,
      role: "assistant",
      contentBlocks: [],
      isStreaming: true,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, assistantMessage]);
    setCurrentAssistantMessageId(assistantMessageId);

    try {
      const result = await window.ipc.agentSendMessage(message);

      if (!result.success) {
        setError(result.error || "Failed to send message");
        // Remove the placeholder assistant message on error
        setMessages(prev => prev.filter(m => m.id !== assistantMessageId));
        setIsStreaming(false);
        setIsLoading(false);
      }
      // Note: Success handling is done via IPC events
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send message";
      setError(errorMessage);
      // Remove the placeholder assistant message on error
      setMessages(prev => prev.filter(m => m.id !== assistantMessageId));
      setIsStreaming(false);
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(async (): Promise<void> => {
    if (typeof window === "undefined" || !window.ipc) return;

    try {
      await window.ipc.agentDisconnect();
      setIsConnected(false);
      setMessages([]);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Disconnect failed";
      setError(errorMessage);
    }
  }, []);

  const clearHistory = useCallback(async (): Promise<void> => {
    if (typeof window === "undefined" || !window.ipc) return;

    try {
      await window.ipc.agentClearHistory();
      setMessages([]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to clear history";
      setError(errorMessage);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const confirmToolCall = useCallback((toolUseId: string) => {
    if (typeof window === "undefined" || !window.ipc) return;
    window.ipc.agentToolConfirmationResponse(true);
    // Clear the pending state from the tool block
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
    // Mark the tool as denied/error
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

  const value = useMemo(() => {
    return {
      // Panel visibility and size
      isPanelOpen,
      panelWidth,
      setPanelWidth,
      openPanel,
      closePanel,
      togglePanel,

      // Header state
      hasSmallHeader,
      setHasSmallHeader,

      // MCP config
      mcpConfig,
      setMcpConfig,

      // Connection state
      messages,
      isConnected,
      isLoading,
      isStreaming,
      error,

      // Tool confirmation (inline)
      confirmToolCall,
      denyToolCall,

      // Actions
      connect,
      sendMessage,
      disconnect,
      clearHistory,
      clearError,
    };
  }, [
    isPanelOpen,
    panelWidth,
    openPanel,
    closePanel,
    togglePanel,
    hasSmallHeader,
    mcpConfig,
    messages,
    isConnected,
    isLoading,
    isStreaming,
    error,
    confirmToolCall,
    denyToolCall,
    connect,
    sendMessage,
    disconnect,
    clearHistory,
    clearError,
  ]);

  return (
    <AgentContext.Provider value={value}>{children}</AgentContext.Provider>
  );
}

export function useAgentContext(): AgentContextType {
  return useContextWithError(AgentContext);
}

export type {
  AgentMessage,
  ContentBlock,
  TextContentBlock,
  ToolUseContentBlock,
  ToolCallEvent,
  ToolResultEvent,
  McpServerConfig,
} from "./types";
