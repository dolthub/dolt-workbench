import { gql } from "@apollo/client";

export const MERGE_PULL = gql`
  mutation MergePull(
    $databaseName: String!
    $fromBranchName: String!
    $toBranchName: String!
    $author: AuthorInfo
  ) {
    mergePull(
      databaseName: $databaseName
      fromBranchName: $fromBranchName
      toBranchName: $toBranchName
      author: $author
    )
  }
`;

export const PULL_CONFLICTS_SUMMARY = gql`
  fragment PullConflictSummary on PullConflictSummary {
    _id
    tableName
    numDataConflicts
    numSchemaConflicts
  }
  query PullConflictsSummary(
    $databaseName: String!
    $fromBranchName: String!
    $toBranchName: String!
  ) {
    pullConflictsSummary(
      databaseName: $databaseName
      fromBranchName: $fromBranchName
      toBranchName: $toBranchName
    ) {
      ...PullConflictSummary
    }
  }
`;
