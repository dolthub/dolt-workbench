import { RemoteBranchDiffCountsFragment } from "@gen/graphql-types";

type ReturnType = {
  branchNameWithRemoteName: string;
  remoteBranchName: string;
};

export function getBranchName(branchName: string): ReturnType {
  if (branchName.startsWith("remotes/")) {
    const branchNameWithRemoteName = branchName.slice(8);
    const remoteBranchName = branchNameWithRemoteName
      .split("/")
      .slice(1)
      .join("/");
    return {
      branchNameWithRemoteName,
      remoteBranchName,
    };
  }
  const remoteBranchName = branchName.split("/").slice(1).join("/");
  return { branchNameWithRemoteName: branchName, remoteBranchName };
}

export function getTooltipContent(
  numbers: RemoteBranchDiffCountsFragment,
  currentBranch: string,
): string {
  const ahead = numbers.ahead
    ? `The local branch ${currentBranch} is ${numbers.ahead} commits ahead`
    : "";
  const behind = numbers.behind
    ? `The local branch ${currentBranch} is ${numbers.behind} commits behind`
    : "";
  return behind ? `${behind}<br/>${ahead}` : ahead;
}
