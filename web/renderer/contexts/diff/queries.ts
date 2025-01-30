import { gql } from "@apollo/client";

export const DIFF_SUMMARIES = gql`
  fragment DiffSummary on DiffSummary {
    _id
    fromTableName
    toTableName
    tableName
    tableType
    hasDataChanges
    hasSchemaChanges
  }
  query DiffSummaries(
    $name: String!
    $databaseName: String!
    $fromRefName: String!
    $toRefName: String!
    $refName: String
    $type: CommitDiffType
  ) {
    diffSummaries(
      name: $name
      databaseName: $databaseName
      fromRefName: $fromRefName
      toRefName: $toRefName
      refName: $refName
      type: $type
    ) {
      ...DiffSummary
    }
  }
`;
