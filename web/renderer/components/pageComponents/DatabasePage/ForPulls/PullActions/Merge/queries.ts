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

export const MERGE_AND_RESOLVE = gql`
  mutation MergeAndResolveConflicts(
    $databaseName: String!
    $fromBranchName: String!
    $toBranchName: String!
    $resolveOursTables: [String!]!
    $resolveTheirsTables: [String!]!
    $author: AuthorInfo
  ) {
    mergeAndResolveConflicts(
      databaseName: $databaseName
      fromBranchName: $fromBranchName
      toBranchName: $toBranchName
      resolveOursTables: $resolveOursTables
      resolveTheirsTables: $resolveTheirsTables
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
