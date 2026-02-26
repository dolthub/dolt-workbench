import fs from "fs";
import os from "os";
import path from "path";
import Store from "electron-store";
import { AgentMessage, ContentBlock, SessionInfo } from "./types";

// SDK stores session JSONL files at ~/.claude/projects/-/
const SDK_DIR = path.join(os.homedir(), ".claude", "projects", "-");

type StoredSession = {
  databaseId: string;
  firstMessage: string;
  created: number;
};

const store = new Store<{ sessions?: Record<string, StoredSession> }>({
  name: "agent-sessions",
});

const SESSIONS_KEY = "sessions";

function getSessionMap(): Record<string, StoredSession> {
  return store.get(SESSIONS_KEY) ?? {};
}

export function listSessions(databaseId: string): SessionInfo[] {
  const sessionMap = getSessionMap();

  return Object.entries(sessionMap)
    .filter(([, entry]) => entry.databaseId === databaseId)
    .map(([sessionId, entry]) => {
      return {
        sessionId,
        firstMessage: entry.firstMessage,
        lastUpdated: entry.created,
      };
    })
    .sort((a, b) => b.lastUpdated - a.lastUpdated);
}

export function loadSessionMessages(sessionId: string): AgentMessage[] {
  try {
    const filePath = path.join(SDK_DIR, `${sessionId}.jsonl`);
    if (!fs.existsSync(filePath)) return [];

    const raw = fs.readFileSync(filePath, "utf-8");
    const lines = raw.split("\n").filter(l => l.trim());
    const messages: AgentMessage[] = [];

    for (const line of lines) {
      let entry: {
        type: string;
        message?: {
          role?: string;
          content?: string | Array<Record<string, unknown>>;
        };
      };
      try {
        entry = JSON.parse(line);
      } catch {
        continue;
      }

      // User messages with text content
      if (entry.type === "user" && entry.message?.content) {
        const content = entry.message.content;
        // User text prompt
        if (typeof content === "string") {
          messages.push({
            id: `hist-user-${messages.length}`,
            role: "user",
            contentBlocks: [{ type: "text", text: content }],
            timestamp: messages.length,
          });
          continue;
        }

        // Array content: could be text or tool_result blocks
        if (Array.isArray(content)) {
          // Check if there are tool_result blocks (merge into previous assistant)
          const toolResults = content.filter(
            (b): b is { type: "tool_result"; tool_use_id: string; content?: unknown; is_error?: boolean } =>
              typeof b === "object" && b.type === "tool_result",
          );
          if (toolResults.length > 0 && messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === "assistant") {
              for (const tr of toolResults) {
                for (const block of lastMsg.contentBlocks) {
                  if (block.type === "tool_use" && block.id === tr.tool_use_id) {
                    block.result = tr.content;
                    block.isError = tr.is_error;
                  }
                }
              }
              continue;
            }
          }

          // Text blocks from user
          const textParts = content.filter(
            (b): b is { type: "text"; text: string } =>
              typeof b === "object" && b.type === "text",
          );
          if (textParts.length > 0) {
            messages.push({
              id: `hist-user-${messages.length}`,
              role: "user",
              contentBlocks: textParts.map(t => {
                return { type: "text" as const, text: t.text };
              }),
              timestamp: messages.length,
            });
          }
        }
        continue;
      }

      // Assistant messages — merge consecutive assistant entries into one
      if (entry.type === "assistant" && entry.message?.content) {
        const content = entry.message.content;
        if (!Array.isArray(content)) continue;

        const blocks: ContentBlock[] = [];
        for (const block of content) {
          if (block.type === "text" && typeof block.text === "string") {
            blocks.push({ type: "text", text: block.text });
          } else if (block.type === "tool_use") {
            const toolBlock = block as {
              type: "tool_use";
              id: string;
              name: string;
              input: Record<string, unknown>;
            };
            blocks.push({
              type: "tool_use",
              id: toolBlock.id,
              name: toolBlock.name,
              input: toolBlock.input,
            });
          }
        }

        if (blocks.length > 0) {
          const lastMsg = messages.length > 0 ? messages[messages.length - 1] : undefined;
          if (lastMsg?.role === "assistant") {
            lastMsg.contentBlocks.push(...blocks);
          } else {
            messages.push({
              id: `hist-assistant-${messages.length}`,
              role: "assistant",
              contentBlocks: blocks,
              timestamp: messages.length,
            });
          }
        }
      }
    }

    return messages;
  } catch (err) {
    console.error("Failed to load session messages:", err);
    return [];
  }
}

export function registerSession(
  sessionId: string,
  databaseId: string,
  firstMessage: string,
): void {
  const sessionMap = getSessionMap();
  // Don't overwrite if already registered
  if (sessionId in sessionMap) return;
  sessionMap[sessionId] = {
    databaseId,
    firstMessage,
    created: Date.now(),
  };
  store.set(SESSIONS_KEY, sessionMap);
}

export function unregisterSession(sessionId: string): void {
  const sessionMap = getSessionMap();
  delete sessionMap[sessionId];
  store.set(SESSIONS_KEY, sessionMap);
}