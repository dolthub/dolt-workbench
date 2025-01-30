import { gql } from "@apollo/client";

export const FETCH_REMOTE = gql`
  query FetchRemote(  name:$String! $remoteName: String!, $databaseName: String!) {
    fetchRemote(name:$name ,remoteName: $remoteName, databaseName: $databaseName) {
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
    name:$String!
    $databaseName: String!
    $toRefName: String!
    $fromRefName: String!
  ) {
    remoteBranchDiffCounts(
      name:$name 
      databaseName: $databaseName
      toRefName: $toRefName
      fromRefName: $fromRefName
    ) {
      ...RemoteBranchDiffCounts
    }
  }
`;
