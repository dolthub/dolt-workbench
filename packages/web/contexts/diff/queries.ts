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
    $databaseName: String!
    $fromCommitId: String!
    $toCommitId: String!
    $refName: String
  ) {
    diffSummaries(
      databaseName: $databaseName
      fromRefName: $fromCommitId
      toRefName: $toCommitId
      refName: $refName
    ) {
      ...DiffSummary
    }
  }
`;
