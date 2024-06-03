import { CommitForHistoryFragment } from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import { colors as customColors } from "@lib/tailwind";
import { commit } from "@lib/urls";

export function getCommits(
  commits: CommitForHistoryFragment[],
  params: RefParams,
) {
  return commits.map(c => {
    return {
      sha: c.commitId,
      commit: {
        author: {
          name: c.committer.username,
          date: c.committedAt,
          email: c.committer.emailAddress,
        },
        message: c.message,
      },
      parents: c.parents.map(p => {
        return { sha: p };
      }),
      html_url: commit({ ...params, commitId: c.commitId }).asPathname(),
    };
  });
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
