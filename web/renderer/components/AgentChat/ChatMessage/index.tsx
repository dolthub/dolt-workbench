import { AgentMessage, ContentBlock, ImageContentBlock } from "@contexts/agent";
import { Markdown } from "@dolthub/react-components";
import { HiDownload } from "@react-icons/all-files/hi/HiDownload";
import cx from "classnames";
import { useCallback } from "react";
import InlineToolCall from "../InlineToolCall";
import css from "./index.module.css";

type Props = {
  message: AgentMessage;
};

// Tool calls that should be hidden from the chat UI
const HIDDEN_TOOL_CALLS = [
  "mcp__workbench__refresh_page",
  "mcp__workbench__display_image",
];

function ImageBlock({ block }: { block: ImageContentBlock }) {
  const handleDownload = useCallback(() => {
    const link = document.createElement("a");
    link.href = block.src;
    link.download = block.alt ?? "image.png";
    link.click();
  }, [block.src, block.alt]);

  return (
    <div className={css.imageWrapper}>
      <button
        type="button"
        className={css.downloadButton}
        onClick={handleDownload}
        aria-label="Download image"
      >
        <HiDownload />
      </button>
      <img src={block.src} alt={block.alt ?? "image"} className={css.image} />
    </div>
  );
}

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

  if (block.type === "image") {
    return <ImageBlock key={`image-${index}`} block={block} />;
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
