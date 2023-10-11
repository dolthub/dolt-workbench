import { CommitForHistoryFragment } from "@gen/graphql-types";
import { getTimeAgoString } from "@lib/dateConversions";
import excerpt from "@lib/excerpt";

const maxCommitMsgChars = 78;

export function limitTwoLines(s: string, maxChars: number): string {
  return excerpt(s.replace(/(\r\n|\n|\r)/g, " "), maxChars);
}

export function getCommitLabel(c: CommitForHistoryFragment): string {
  return `${c.commitId}
${limitTwoLines(c.message, maxCommitMsgChars)}
${getTimeAgoString(c.committedAt)}`;
}
