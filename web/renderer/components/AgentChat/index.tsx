import { useAgentContext } from "@contexts/agent";
import { useCallback, useEffect, useRef, useState } from "react";
import ApiKeyModal from "./ApiKeyModal";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import css from "./index.module.css";

type Props = {
  onClose: () => void;
};

export default function AgentChat({ onClose }: Props) {
  const {
    mcpConfig,
    messages,
    isConnected,
    isLoading,
    isStreaming,
    error,
    connect,
    sendMessage,
    disconnect,
    clearHistory,
    clearError,
  } = useAgentContext();

  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const autoConnectAttemptedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const handleConnect = useCallback(
    async (apiKey: string) => {
      if (!mcpConfig) {
        setConnectError("No database connection available");
        return;
      }
      setConnectError(null);
      const success = await connect(apiKey, mcpConfig);
      if (success) {
        setShowApiKeyModal(false);
        // Always store the API key
        if (window.ipc?.agentStoreApiKey) {
          window.ipc.agentStoreApiKey(apiKey);
        }
      } else {
        setConnectError(error || "Failed to connect");
        // If auto-connect failed, show the modal so user can fix the key
        setShowApiKeyModal(true);
      }
    },
    [mcpConfig, connect, error],
  );

  // Try to auto-connect with stored API key, or show modal if none exists
  useEffect(() => {
    const tryAutoConnect = async () => {
      if (!isConnected && mcpConfig && !autoConnectAttemptedRef.current) {
        autoConnectAttemptedRef.current = true;

        if (typeof window !== "undefined" && window.ipc?.agentGetApiKey) {
          const storedKey = await window.ipc.agentGetApiKey();
          if (storedKey) {
            // Auto-connect with stored key
            await handleConnect(storedKey);
          } else {
            // No stored key, show modal
            setShowApiKeyModal(true);
          }
        } else {
          setShowApiKeyModal(true);
        }
      }
    };
    void tryAutoConnect();
  }, [isConnected, mcpConfig, handleConnect]);

  const handleSendMessage = async (message: string) => {
    clearError();
    await sendMessage(message);
  };

  const handleDisconnect = async () => {
    await disconnect();
    autoConnectAttemptedRef.current = false;
    setShowApiKeyModal(true);
  };

  const handleEditApiKey = () => {
    setShowApiKeyModal(true);
  };

  const handleClearHistory = async () => {
    await clearHistory();
  };

  const handleCloseModal = () => {
    setShowApiKeyModal(false);
    if (!isConnected) {
      onClose();
    }
  };

  return (
    <div className={css.container}>
      <button
        type="button"
        onClick={onClose}
        className={css.closeButton}
        aria-label="Close panel"
      >
        ×
      </button>

      <div className={css.messagesContainer}>
        {messages.length === 0 ? (
          <div className={css.emptyState}>
            <p>Ask me anything about your database!</p>
            <p className={css.emptyStateHint}>
              Try: &quot;What tables are in this database?&quot;
            </p>
          </div>
        ) : (
          messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && !showApiKeyModal && (
        <div className={css.errorBanner}>
          <span>{error}</span>
          <button
            type="button"
            onClick={clearError}
            className={css.dismissError}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className={css.inputContainer}>
        <ChatInput
          onSend={handleSendMessage}
          disabled={!isConnected}
          isLoading={isLoading || isStreaming}
        />
        {isConnected && (
          <div className={css.inputActions}>
            <button
              type="button"
              onClick={handleClearHistory}
              disabled={isLoading}
              className={css.textButton}
            >
              Clear history
            </button>
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={isLoading}
              className={css.textButton}
            >
              Disconnect
            </button>
            <button
              type="button"
              onClick={handleEditApiKey}
              disabled={isLoading}
              className={css.textButton}
            >
              Edit API key
            </button>
          </div>
        )}
      </div>

      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={handleCloseModal}
        onSubmit={handleConnect}
        isLoading={isLoading}
        error={connectError}
      />
    </div>
  );
}
