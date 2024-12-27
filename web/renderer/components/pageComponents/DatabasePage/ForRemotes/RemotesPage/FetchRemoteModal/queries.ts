import { gql } from "@apollo/client";

export const FETCH_REMOTE = gql`
  fragment FetchRes on FetchRes {
    success
  }
  mutation FetchRemote(
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

export const MERGE_BASE = gql`
  fragment aheadOrBehind on AheadOrBehind {
    ahead
    behind
  }
  query MergeBase(
    $databaseName: String!
    $branchName: String!
    $anotherBranch: String!
  ) {
    mergeBase(
      databaseName: $databaseName
      branchName: $branchName
      anotherBranch: $anotherBranch
    ) {
      ...aheadOrBehind
    }
  }
`;
