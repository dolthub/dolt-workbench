import { Button, Textarea } from "@dolthub/react-components";
import { ChangeEvent, FormEvent, KeyboardEvent, useState } from "react";
import css from "./index.module.css";

type Props = {
  onSend: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
};

export default function ChatInput({ onSend, disabled, isLoading }: Props) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled && !isLoading) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className={css.inputForm}>
      <Textarea
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Ask about your database..."
        rows={2}
        disabled={disabled || isLoading}
        className={css.textarea}
        light
      />
      <Button
        type="submit"
        disabled={!message.trim() || disabled || isLoading}
        className={css.sendButton}
      >
        {isLoading ? "Thinking..." : "Send"}
      </Button>
    </form>
  );
}
