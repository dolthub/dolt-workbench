import { gql } from "@apollo/client";

export const FETCH_REMOTE = gql`
  fragment FetchRes on FetchRes {
    success
  }
  query FetchRemote(
    $remoteName: String!
    $databaseName: String!
    $branchName: String
  ) {
    fetchRemote(
      remoteName: $remoteName
      databaseName: $databaseName
      branchName: $branchName
    ) {
      ...FetchRes
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
