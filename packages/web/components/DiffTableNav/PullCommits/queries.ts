import { gql } from "@apollo/client";

export const PULL_COMMITS = gql`
  query PullCommits(
    $databaseName: String!
    $refName: String!
    $excludingCommitsFromRefName: String!
  ) {
    commits(
      databaseName: $databaseName
      refName: $refName
      excludingCommitsFromRefName: $excludingCommitsFromRefName
      twoDot: true
    ) {
      list {
        ...CommitForHistory
      }
    }
  }
`;
