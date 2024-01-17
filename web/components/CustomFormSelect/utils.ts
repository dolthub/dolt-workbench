import { excerpt, getTimeAgoString } from "@dolthub/web-utils";
import { CommitForHistoryFragment } from "@gen/graphql-types";

const maxCommitMsgChars = 78;

export function limitTwoLines(s: string, maxChars: number): string {
  return excerpt(s.replace(/(\r\n|\n|\r)/g, " "), maxChars);
}

export function getCommitLabel(c: CommitForHistoryFragment): string {
  return `${c.commitId}
${limitTwoLines(c.message, maxCommitMsgChars)}
${getTimeAgoString(c.committedAt)}`;
}
