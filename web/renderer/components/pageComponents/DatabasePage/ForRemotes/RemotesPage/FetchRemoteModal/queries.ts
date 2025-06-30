import { gql } from "@apollo/client";

export const FETCH_REMOTE = gql`
  mutation FetchRemote($remoteName: String!, $databaseName: String!) {
    fetchRemote(remoteName: $remoteName, databaseName: $databaseName) {
      success
    }
  }
`;

export const CREATE_BRANCH_FROM_REMOTE = gql`
  mutation CreateBranchFromRemote(
    $remoteName: String!
    $branchName: String!
    $databaseName: String!
  ) {
    createBranchFromRemote(
      remoteName: $remoteName
      branchName: $branchName
      databaseName: $databaseName
    ) {
      success
    }
  }
`;

export const AHEAD_BEHIND_COUNT = gql`
  fragment RemoteBranchDiffCounts on RemoteBranchDiffCounts {
    ahead
    behind
  }
  query RemoteBranchDiffCounts(
    $databaseName: String!
    $toRefName: String!
    $fromRefName: String!
  ) {
    remoteBranchDiffCounts(
      databaseName: $databaseName
      toRefName: $toRefName
      fromRefName: $fromRefName
    ) {
      ...RemoteBranchDiffCounts
    }
  }
`;

export const REMOTE_BRANCHES = gql`
  query RemoteBranches(
    $databaseName: String!
    $remoteName: String!
    $offset: Int
  ) {
    remoteBranches(
      databaseName: $databaseName
      remoteName: $remoteName
      offset: $offset
    ) {
      list {
        ...Branch
      }
      nextOffset
    }
  }
`;
