import { gql } from "@apollo/client";

export const DOLT_COMMIT_DIFF = gql`
  query DoltCommitDiff(
    $databaseName: String!
    $refName: String!
    $schemaName: String
    $tableName: String!
    $fromCommitId: String!
    $toCommitId: String!
    $excludedColumns: [String!]
    $type: CommitDiffType
  ) {
    doltCommitDiff(
      databaseName: $databaseName
      refName: $refName
      schemaName: $schemaName
      tableName: $tableName
      fromCommitId: $fromCommitId
      toCommitId: $toCommitId
      excludedColumns: $excludedColumns
      type: $type
    )
  }
`;
