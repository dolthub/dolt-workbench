import { gql } from "@apollo/client";

export const ROW_DIFFS = gql`
  fragment ColumnForDiffTableList on Column {
    name
    isPrimaryKey
    type
    constraints {
      notNull
    }
  }
  fragment ColumnValueForTableList on ColumnValue {
    displayValue
  }
  fragment RowForTableList on Row {
    columnValues {
      ...ColumnValueForTableList
    }
  }
  fragment RowDiffForTableList on RowDiff {
    added {
      ...RowForTableList
    }
    deleted {
      ...RowForTableList
    }
  }
  fragment RowDiffListWithCols on RowDiffList {
    list {
      ...RowDiffForTableList
    }
    columns {
      ...ColumnForDiffTableList
    }
    nextOffset
  }
  query RowDiffs(
    $databaseName: String!
    $tableName: String!
    $fromCommitId: String!
    $toCommitId: String!
    $refName: String
    $offset: Int
    $filterByRowType: DiffRowType
  ) {
    rowDiffs(
      databaseName: $databaseName
      tableName: $tableName
      fromCommitId: $fromCommitId
      toCommitId: $toCommitId
      refName: $refName
      offset: $offset
      filterByRowType: $filterByRowType
    ) {
      ...RowDiffListWithCols
    }
  }
`;

export const SCHEMA_DIFF = gql`
  fragment SchemaDiffForTableList on TextDiff {
    leftLines
    rightLines
  }
  fragment SchemaDiff on SchemaDiff {
    schemaDiff {
      ...SchemaDiffForTableList
    }
    schemaPatch
  }
  query SchemaDiff(
    $databaseName: String!
    $tableName: String!
    $fromCommitId: String!
    $toCommitId: String!
    $refName: String
  ) {
    schemaDiff(
      databaseName: $databaseName
      tableName: $tableName
      fromCommitId: $fromCommitId
      toCommitId: $toCommitId
      refName: $refName
    ) {
      ...SchemaDiff
    }
  }
`;
