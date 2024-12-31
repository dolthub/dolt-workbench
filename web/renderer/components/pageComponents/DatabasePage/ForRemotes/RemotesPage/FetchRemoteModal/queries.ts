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
  fragment AheadAndBehindCount on AheadAndBehindCount {
    ahead
    behind
  }
  query AheadAndBehindCount(
    $databaseName: String!
    $toRefName: String!
    $fromRefName: String!
  ) {
    aheadAndBehindCount(
      databaseName: $databaseName
      toRefName: $toRefName
      fromRefName: $fromRefName
    ) {
      ...AheadAndBehindCount
    }
  }
`;
