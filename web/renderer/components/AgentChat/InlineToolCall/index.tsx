import { ToolUseContentBlock, useAgentContext } from "@contexts/agent";
import { Button } from "@dolthub/react-components";
import cx from "classnames";
import { useEffect, useRef, useState } from "react";
import { FaStopCircle } from "@react-icons/all-files/fa/FaStopCircle";
import css from "./index.module.css";

type Props = {
  block: ToolUseContentBlock;
};

// Format tool name for display (e.g., "mcp__dolt__create_dolt_commit" -> "Create Dolt Commit")
function formatToolName(toolName: string): string {
  // Remove common MCP prefixes
  const name = toolName
    .replace("mcp__dolt__", "")
    .replace("mcp__workbench__", "");
  // Convert snake_case to Title Case
  return name
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getStatusIcon(
  isPendingConfirmation: boolean,
  isPending: boolean,
  isError: boolean,
): string {
  if (isPendingConfirmation) return "?";
  if (isPending) return "...";
  if (isError) return "!";
  return "\u2713";
}

export default function InlineToolCall({ block }: Props) {
  const { confirmToolCall, denyToolCall, cancelToolCall } = useAgentContext();
  const [isExpanded, setIsExpanded] = useState(
    block.pendingConfirmation ?? false,
  );

  // Auto-expand when confirmation is requested
  useEffect(() => {
    if (block.pendingConfirmation) {
      setIsExpanded(true);
    }
  }, [block.pendingConfirmation]);

  const hasResult = block.result !== undefined;
  const isError = block.isError;
  const isPendingConfirmation = block.pendingConfirmation;
  const isPending = !hasResult && !isPendingConfirmation;

  // Only show stop button after 2 seconds of pending
  const [showStop, setShowStop] = useState(false);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isPending) {
      stopTimerRef.current = setTimeout(() => setShowStop(true), 2000);
    } else {
      setShowStop(false);
      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current);
        stopTimerRef.current = null;
      }
    }
    return () => {
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
    };
  }, [isPending]);

  const formatValue = (value: unknown): string => {
    if (typeof value === "string") return value;
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  return (
    <div
      className={cx(css.container, {
        [css.error]: isError,
        [css.pending]: isPending,
        [css.confirmation]: isPendingConfirmation,
      })}
    >
      <button
        type="button"
        className={css.header}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <span className={css.icon}>
          {getStatusIcon(!!isPendingConfirmation, isPending, !!isError)}
        </span>
        <span className={css.name}>
          {isPendingConfirmation
            ? `Confirm: ${formatToolName(block.name)}`
            : formatToolName(block.name)}
        </span>
        {showStop && (
          <button
            type="button"
            className={css.stopButton}
            onClick={e => {
              e.stopPropagation();
              cancelToolCall(block.id, block.name);
            }}
            title="Cancel this tool call"
          >
            <FaStopCircle className={css.stopIcon} />
          </button>
        )}
        <span className={css.expandIcon}>{isExpanded ? "\u2212" : "+"}</span>
      </button>

      {isExpanded && (
        <div className={css.details}>
          {isPendingConfirmation && (
            <div className={css.confirmationMessage}>
              This action requires your confirmation before proceeding.
            </div>
          )}
          <div className={css.section}>
            <span className={css.sectionLabel}>Input:</span>
            <pre className={css.code}>{formatValue(block.input)}</pre>
          </div>
          {hasResult && (
            <div className={css.section}>
              <span className={css.sectionLabel}>
                {isError ? "Error:" : "Result:"}
              </span>
              <pre
                className={cx(css.code, {
                  [css.codeError]: isError,
                })}
              >
                {formatValue(block.result)}
              </pre>
            </div>
          )}
          {isPendingConfirmation && (
            <div className={css.confirmationActions}>
              <Button onClick={() => denyToolCall(block.id)}>Cancel</Button>
              <Button onClick={() => confirmToolCall(block.id)} green>
                Confirm
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
