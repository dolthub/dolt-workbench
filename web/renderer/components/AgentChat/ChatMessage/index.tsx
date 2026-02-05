import { AgentMessage, ContentBlock } from "@contexts/agent";
import { Markdown } from "@dolthub/react-components";
import cx from "classnames";
import InlineToolCall from "../InlineToolCall";
import css from "./index.module.css";

type Props = {
  message: AgentMessage;
};

// Tool calls that should be hidden from the chat UI
const HIDDEN_TOOL_CALLS = ["mcp__workbench__refresh_page"];

function renderContentBlock(block: ContentBlock, index: number) {
  if (block.type === "text") {
    return (
      <Markdown
        key={`text-${index}`}
        value={block.text}
        className={css.markdown}
      />
    );
  }

  // Hide certain tool calls from the UI
  if (HIDDEN_TOOL_CALLS.includes(block.name)) {
    return null;
  }

  // block.type === "tool_use"
  return <InlineToolCall key={block.id} block={block} />;
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";
  const hasContent = message.contentBlocks.length > 0;

  // For user messages, just show the text content
  if (isUser) {
    const textContent = message.contentBlocks
      .filter((b): b is { type: "text"; text: string } => b.type === "text")
      .map(b => b.text)
      .join("\n");

    return (
      <div className={cx(css.message, css.userMessage)}>
        <div className={css.role}>You</div>
        <div className={css.content}>{textContent}</div>
      </div>
    );
  }

  // For assistant messages, render content blocks inline
  return (
    <div
      className={cx(css.message, css.assistantMessage, {
        [css.streaming]: message.isStreaming,
      })}
    >
      <div className={css.role}>Assistant</div>
      <div className={css.content}>
        {hasContent
          ? message.contentBlocks.map((block, index) =>
              renderContentBlock(block, index),
            )
          : message.isStreaming && (
              <span className={css.thinking}>Thinking...</span>
            )}
      </div>
    </div>
  );
}
