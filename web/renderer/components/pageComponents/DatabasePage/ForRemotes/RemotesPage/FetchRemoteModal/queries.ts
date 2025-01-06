import { gql } from "@apollo/client";

export const FETCH_REMOTE = gql`
  query FetchRemote($remoteName: String!, $databaseName: String!) {
    fetchRemote(remoteName: $remoteName, databaseName: $databaseName) {
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
