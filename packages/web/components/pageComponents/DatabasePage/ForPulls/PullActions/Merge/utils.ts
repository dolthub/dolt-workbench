import { PullDiffParams } from "@lib/params";

export function getMergeCommands(params: PullDiffParams): string {
  return `CALL DOLT_CHECKOUT("${params.toBranchName}");
CALL DOLT_MERGE("${params.fromBranchName}");`;
}
