import { gql } from "@apollo/client";

export const BRANCHES_FOR_BRANCHES_PAGE_QUERY = gql`
  fragment Branch on Branch {
    _id
    branchName
    databaseName
    lastUpdated
    lastCommitter
  }
  query BranchList(
    $databaseName: String!
    $sortBy: SortBranchesBy
    $offset: Int
  ) {
    branches(databaseName: $databaseName, sortBy: $sortBy, offset: $offset) {
      list {
        ...Branch
      }
      nextOffset
    }
  }
`;

export const REMOTE_BRANCHES = gql`
  query RemoteBranches(
    $databaseName: String!
    $sortBy: SortBranchesBy
    $offset: Int
  ) {
    remoteBranches(
      databaseName: $databaseName
      sortBy: $sortBy
      offset: $offset
    ) {
      list {
        ...Branch
      }
      nextOffset
    }
  }
`;

export const DELETE_BRANCH = gql`
  mutation DeleteBranch($branchName: String!, $databaseName: String!) {
    deleteBranch(branchName: $branchName, databaseName: $databaseName)
  }
`;
