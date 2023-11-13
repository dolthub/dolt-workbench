import { SortBranchesBy } from "./branch.enum";

export const branchQuery = `SELECT * FROM dolt_branches WHERE name=?`;

export const getBranchesQuery = (sortBy?: SortBranchesBy) =>
  `SELECT * FROM dolt_branches ${getOrderByForBranches(sortBy)}`;

export const callNewBranch = `CALL DOLT_BRANCH(?, ?)`;

export const callDeleteBranch = `CALL DOLT_BRANCH("-D", ?)`;

function getOrderByForBranches(sortBy?: SortBranchesBy): string {
  switch (sortBy) {
    case SortBranchesBy.LastUpdated:
      return "ORDER BY latest_commit_date DESC ";
    default:
      return "";
  }
}
