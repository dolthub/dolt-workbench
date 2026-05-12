import { gql } from "@apollo/client";

export const DOLT_COMMIT_DIFF = gql`
  fragment RowForDoltCommitDiff on Row {
    columnValues {
      displayValue
    }
    diff {
      diffColumnNames
      diffColumnValues {
        displayValue
      }
    }
  }
  fragment ColumnForDoltCommitDiff on Column {
    name
    isPrimaryKey
    type
    sourceTable
    constraints {
      notNull
    }
  }
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
    ) {
      queryString
      columns {
        ...ColumnForDoltCommitDiff
      }
      rows {
        list {
          ...RowForDoltCommitDiff
        }
      }
    }
  }
`;
