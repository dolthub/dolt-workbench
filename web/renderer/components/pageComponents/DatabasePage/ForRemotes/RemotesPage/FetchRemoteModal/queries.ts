import { gql } from "@apollo/client";

export const FETCH_REMOTE = gql`
  query FetchRemote(
    $connectionName: String!
    $remoteName: String!
    $databaseName: String!
  ) {
    fetchRemote(
      connectionName: $connectionName
      remoteName: $remoteName
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
    $connectionName: String!
    $databaseName: String!
    $toRefName: String!
    $fromRefName: String!
  ) {
    remoteBranchDiffCounts(
      connectionName: $connectionName
      databaseName: $databaseName
      toRefName: $toRefName
      fromRefName: $fromRefName
    ) {
      ...RemoteBranchDiffCounts
    }
  }
`;
