import { gql } from "@apollo/client";

export const BRANCHES_FOR_BRANCHES_PAGE_QUERY = gql`
  fragment Branch on Branch {
    _id
    branchName
    connectionName
    databaseName
    lastUpdated
    lastCommitter
  }
  query BranchList(
    $connectionName: String!
    $databaseName: String!
    $sortBy: SortBranchesBy
    $offset: Int
  ) {
    branches(
      connectionName: $connectionName
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

export const REMOTE_BRANCHES = gql`
  query RemoteBranches(
    $connectionName: String!
    $databaseName: String!
    $sortBy: SortBranchesBy
    $offset: Int
  ) {
    remoteBranches(
      connectionName: $connectionName
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
  mutation DeleteBranch(
    $connectionName: String!
    $branchName: String!
    $databaseName: String!
  ) {
    deleteBranch(
      connectionName: $connectionName
      branchName: $branchName
      databaseName: $databaseName
    )
  }
`;
