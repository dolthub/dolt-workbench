import { gql } from "@apollo/client";

export const BRANCHES_FOR_BRANCHES_PAGE_QUERY = gql`
  fragment Branch on Branch {
    _id
    branchName
    databaseName
    lastUpdated
    lastCommitter
  }
  query BranchList($databaseName: String!, $sortBy: SortBranchesBy) {
    branches(databaseName: $databaseName, sortBy: $sortBy) {
      list {
        ...Branch
      }
    }
  }
`;

export const DELETE_BRANCH = gql`
  mutation DeleteBranch($branchName: String!, $databaseName: String!) {
    deleteBranch(branchName: $branchName, databaseName: $databaseName)
  }
`;
