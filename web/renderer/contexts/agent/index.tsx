import { createCustomContext } from "@dolthub/react-contexts";
import { useContextWithError } from "@dolthub/react-hooks";
import { ReactNode, useMemo } from "react";
import { AgentContextType } from "./types";
import { useAgentSession } from "./useAgentSession";
import { usePanelState } from "./usePanelState";

export const AgentContext =
  createCustomContext<AgentContextType>("AgentContext");

type Props = {
  children: ReactNode;
};

export function AgentProvider({ children }: Props) {
  const panel = usePanelState();
  const session = useAgentSession();

  const value = useMemo<AgentContextType>(() => {
    return {
      // Panel state
      isPanelOpen: panel.isPanelOpen,
      panelWidth: panel.panelWidth,
      setPanelWidth: panel.setPanelWidth,
      hasSmallHeader: panel.hasSmallHeader,
      setHasSmallHeader: panel.setHasSmallHeader,
      openPanel: panel.openPanel,
      closePanel: panel.closePanel,
      togglePanel: panel.togglePanel,

      // Session state
      mcpConfig: session.mcpConfig,
      setMcpConfig: session.setMcpConfig,
      messages: session.messages,
      isConnected: session.isConnected,
      isLoading: session.isLoading,
      isStreaming: session.isStreaming,
      error: session.error,
      confirmToolCall: session.confirmToolCall,
      denyToolCall: session.denyToolCall,
      connect: session.connect,
      sendMessage: session.sendMessage,
      disconnect: session.disconnect,
      clearHistory: session.clearHistory,
      clearError: session.clearError,
    };
  }, [panel, session]);

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
