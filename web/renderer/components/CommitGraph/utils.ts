import { CommitForHistoryFragment } from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import { colors as customColors } from "@lib/tailwind";
import { commit } from "@lib/urls";
import { Commit } from "commit-graph";
import { NextRouter } from "next/router";

export function getCommit(
  c: CommitForHistoryFragment,
  params: RefParams,
  router: NextRouter,
): Commit {
  return {
    sha: c.commitId,
    commit: {
      author: {
        name: c.committer.username || "",
        date: c.committedAt,
        email: c.committer.emailAddress,
      },
      message: c.message,
    },
    parents: c.parents.map(p => {
      return { sha: p };
    }),
    onCommitNavigate: () => {
      const { href, as } = commit({ ...params, commitId: c.commitId });
      router.push(href, as).catch(console.error);
    },
  };
}

export function getCommits(
  commits: CommitForHistoryFragment[],
  params: RefParams,
  router: NextRouter,
): Commit[] {
  return commits.map(c => getCommit(c, params, router));
}

// colors to choose from for branch paths
export const branchPathColors = [
  customColors.ocean["700"],
  customColors.coral["400"],
  customColors.sky["600"],
  customColors.mint["200"],
  "#C5A15A",
  "#FA7978",
  customColors.stone["500"],
  customColors.green["500"],
  "#5C5AC5",
  "#EB7340",
];
