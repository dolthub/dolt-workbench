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
    $fromRefName: String!
    $toRefName: String!
    $refName: String
    $offset: Int
    $filterByRowType: DiffRowType
    $type: CommitDiffType
  ) {
    rowDiffs(
      databaseName: $databaseName
      tableName: $tableName
      fromRefName: $fromRefName
      toRefName: $toRefName
      refName: $refName
      offset: $offset
      filterByRowType: $filterByRowType
      type: $type
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
    $fromRefName: String!
    $toRefName: String!
    $refName: String
  ) {
    schemaDiff(
      databaseName: $databaseName
      tableName: $tableName
      fromRefName: $fromRefName
      toRefName: $toRefName
      refName: $refName
    ) {
      ...SchemaDiff
    }
  }
`;
