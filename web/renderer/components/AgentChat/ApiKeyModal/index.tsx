import { ExternalLink, FormInput, FormModal } from "@dolthub/react-components";
import { SyntheticEvent, useEffect, useState } from "react";
import css from "./index.module.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (apiKey: string) => void;
  isLoading?: boolean;
  error?: string | null;
};

export default function ApiKeyModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  error,
}: Props) {
  const [apiKey, setApiKey] = useState("");

  // Load stored API key when modal opens
  useEffect(() => {
    if (isOpen && typeof window !== "undefined" && window.ipc?.agentGetApiKey) {
      window.ipc.agentGetApiKey().then((storedKey: string) => {
        if (storedKey) {
          setApiKey(storedKey);
        }
      });
    }
  }, [isOpen]);

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSubmit(apiKey.trim());
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onRequestClose={onClose}
      title="Connect Agent"
      onSubmit={handleSubmit}
      disabled={!apiKey.trim() || isLoading}
      btnText={isLoading ? "Connecting..." : "Connect"}
      err={error ? new Error(error) : undefined}
    >
      <p className={css.description}>
        Enter your Anthropic API key to enable the AI agent. Your key will be
        stored for future sessions. You can find your API key{" "}
        <ExternalLink href="https://platform.claude.com/settings/keys">
          here
        </ExternalLink>
        .
      </p>
      <FormInput
        value={apiKey}
        onChangeString={setApiKey}
        label="Anthropic API Key"
        placeholder="sk-ant-..."
        type="password"
        required
        light
      />
    </FormModal>
  );
}
