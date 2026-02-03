import { ToolUseContentBlock, useAgentContext } from "@contexts/agent";
import { Button } from "@dolthub/react-components";
import cx from "classnames";
import { useState } from "react";
import css from "./index.module.css";

type Props = {
  block: ToolUseContentBlock;
};

// Format tool name for display (e.g., "mcp__dolt__create_dolt_commit" -> "Create Dolt Commit")
function formatToolName(toolName: string): string {
  // Remove the mcp__dolt__ prefix
  const name = toolName.replace("mcp__dolt__", "");
  // Convert snake_case to Title Case
  return name
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function InlineToolCall({ block }: Props) {
  const { confirmToolCall, denyToolCall } = useAgentContext();
  const [isExpanded, setIsExpanded] = useState(
    block.pendingConfirmation ?? false,
  );

  const hasResult = block.result !== undefined;
  const isError = block.isError;
  const isPendingConfirmation = block.pendingConfirmation;
  const isPending = !hasResult && !isPendingConfirmation;

  const formatValue = (value: unknown): string => {
    if (typeof value === "string") return value;
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  const handleConfirm = () => {
    confirmToolCall(block.id);
  };

  const handleDeny = () => {
    denyToolCall(block.id);
  };

  return (
    <div
      className={cx(css.inlineToolCall, {
        [css.toolCallError]: isError,
        [css.toolCallPending]: isPending,
        [css.toolCallConfirmation]: isPendingConfirmation,
      })}
    >
      <button
        type="button"
        className={css.inlineToolCallHeader}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className={css.toolCallIcon}>
          {isPendingConfirmation
            ? "?"
            : isPending
              ? "..."
              : isError
                ? "!"
                : "\u2713"}
        </span>
        <span className={css.toolName}>
          {isPendingConfirmation
            ? `Confirm: ${formatToolName(block.name)}`
            : block.name}
        </span>
        <span className={css.expandIcon}>{isExpanded ? "\u2212" : "+"}</span>
      </button>

      {isExpanded && (
        <div className={css.toolCallDetails}>
          {isPendingConfirmation && (
            <div className={css.confirmationMessage}>
              This action requires your confirmation before proceeding.
            </div>
          )}
          <div className={css.toolSection}>
            <span className={css.toolSectionLabel}>Input:</span>
            <pre className={css.toolCode}>{formatValue(block.input)}</pre>
          </div>
          {hasResult && (
            <div className={css.toolSection}>
              <span className={css.toolSectionLabel}>
                {isError ? "Error:" : "Result:"}
              </span>
              <pre
                className={cx(css.toolCode, {
                  [css.toolCodeError]: isError,
                })}
              >
                {formatValue(block.result)}
              </pre>
            </div>
          )}
          {isPendingConfirmation && (
            <div className={css.confirmationActions}>
              <Button onClick={handleDeny}>Cancel</Button>
              <Button onClick={handleConfirm} green>
                Confirm
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
