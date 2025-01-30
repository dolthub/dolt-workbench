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
    $name: String!
    $databaseName: String!
    $sortBy: SortBranchesBy
    $offset: Int
  ) {
    branches(
      name: $name
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
    $name: String!
    $databaseName: String!
    $sortBy: SortBranchesBy
    $offset: Int
  ) {
    remoteBranches(
      name: $name
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
    $name: String!
    $branchName: String!
    $databaseName: String!
  ) {
    deleteBranch(
      name: $name
      branchName: $branchName
      databaseName: $databaseName
    )
  }
`;
