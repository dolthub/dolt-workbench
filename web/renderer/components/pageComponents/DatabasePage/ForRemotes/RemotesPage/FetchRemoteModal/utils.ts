import { AheadBehindCountFragment } from "@gen/graphql-types";

type ReturnType = {
  remoteAndBranchName: string;
  remoteBranchName: string;
};

export function getBranchName(branchName: string): ReturnType {
  if (branchName.startsWith("remotes/")) {
    const remoteAndBranchName = branchName.slice(8);
    const remoteBranchName = remoteAndBranchName.split("/").slice(1).join("/");
    return {
      remoteAndBranchName,
      remoteBranchName,
    };
  }
  const remoteBranchName = branchName.split("/").slice(1).join("");
  return { remoteAndBranchName: branchName, remoteBranchName };
}

export function getTooltipContent(numbers: AheadBehindCountFragment): string {
  const ahead = numbers.ahead
    ? `The local branch is ${numbers.ahead} commits ahead`
    : "";
  const behind = numbers.behind
    ? `The local branch is ${numbers.behind} commits behind`
    : "";
  return `${ahead}<br/>${behind}`;
}
