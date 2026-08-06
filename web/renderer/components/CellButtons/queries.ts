import { gql } from "@apollo/client";

export const DELETE_ROW = gql`
  mutation DeleteRow(
    $databaseName: String!
    $refName: String!
    $schemaName: String
    $tableName: String!
    $where: [ColumnValueInput!]!
  ) {
    deleteRow(
      databaseName: $databaseName
      refName: $refName
      schemaName: $schemaName
      tableName: $tableName
      where: $where
    ) {
      rowsAffected
      queryString
      executionMessage
    }
  }
`;

export const INSERT_ROW = gql`
  mutation InsertRow(
    $databaseName: String!
    $refName: String!
    $schemaName: String
    $tableName: String!
    $values: [ColumnValueInput!]!
  ) {
    insertRow(
      databaseName: $databaseName
      refName: $refName
      schemaName: $schemaName
      tableName: $tableName
      values: $values
    ) {
      rowsAffected
      queryString
      executionMessage
    }
  }
`;

export const UPDATE_ROW = gql`
  mutation UpdateRow(
    $databaseName: String!
    $refName: String!
    $schemaName: String
    $tableName: String!
    $set: [ColumnValueInput!]!
    $where: [ColumnValueInput!]!
  ) {
    updateRow(
      databaseName: $databaseName
      refName: $refName
      schemaName: $schemaName
      tableName: $tableName
      set: $set
      where: $where
    ) {
      rowsAffected
      queryString
      executionMessage
    }
  }
`;

export const DOLT_LOOKUP_FRAGMENT = gql`
  fragment RowForDoltLookup on Row {
    columnValues {
      displayValue
    }
  }
  fragment ColumnForDoltLookup on Column {
    name
    isPrimaryKey
    type
  }
  fragment SqlSelectForDoltLookup on SqlSelect {
    queryString
    columns {
      ...ColumnForDoltLookup
    }
    rows {
      list {
        ...RowForDoltLookup
      }
    }
  }
`;

export const DOLT_CELL_DIFF = gql`
  ${DOLT_LOOKUP_FRAGMENT}
  query DoltCellDiff(
    $databaseName: String!
    $refName: String!
    $schemaName: String
    $tableName: String!
    $pkValues: [ColumnValueInput!]!
    $columnName: String
  ) {
    doltCellDiff(
      databaseName: $databaseName
      refName: $refName
      schemaName: $schemaName
      tableName: $tableName
      pkValues: $pkValues
      columnName: $columnName
    ) {
      ...SqlSelectForDoltLookup
    }
  }
`;

export const DOLT_CELL_HISTORY = gql`
  ${DOLT_LOOKUP_FRAGMENT}
  query DoltCellHistory(
    $databaseName: String!
    $refName: String!
    $schemaName: String
    $tableName: String!
    $pkValues: [ColumnValueInput!]!
    $columnName: String
  ) {
    doltCellHistory(
      databaseName: $databaseName
      refName: $refName
      schemaName: $schemaName
      tableName: $tableName
      pkValues: $pkValues
      columnName: $columnName
    ) {
      ...SqlSelectForDoltLookup
    }
  }
`;

export const DROP_COLUMN = gql`
  mutation DropColumn(
    $databaseName: String!
    $refName: String!
    $schemaName: String
    $tableName: String!
    $columnName: String!
  ) {
    dropColumn(
      databaseName: $databaseName
      refName: $refName
      schemaName: $schemaName
      tableName: $tableName
      columnName: $columnName
    ) {
      rowsAffected
      queryString
      executionMessage
    }
  }
`;
