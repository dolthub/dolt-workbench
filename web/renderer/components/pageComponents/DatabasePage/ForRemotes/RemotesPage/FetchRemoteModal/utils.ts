import { AheadAndBehindCountFragment } from "@gen/graphql-types";

type ReturnType = {
  branchNameWithRemotePrefix: string;
  remoteBranchName: string;
};

export function getBranchName(branchName: string): ReturnType {
  if (branchName.startsWith("remotes/")) {
    const branchNameWithRemotePrefix = branchName.slice(8);
    const remoteBranchName = branchNameWithRemotePrefix
      .split("/")
      .slice(1)
      .join("/");
    return {
      branchNameWithRemotePrefix,
      remoteBranchName,
    };
  }
  const remoteBranchName = branchName.split("/").slice(1).join("");
  return { branchNameWithRemotePrefix: branchName, remoteBranchName };
}

export function getTooltipContent(
  numbers: AheadAndBehindCountFragment,
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
