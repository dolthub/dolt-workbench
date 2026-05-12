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

const DOLT_CELL_LOOKUP_FRAGMENT = gql`
  fragment RowForDoltCellLookup on Row {
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
  fragment ColumnForDoltCellLookup on Column {
    name
    isPrimaryKey
    type
    sourceTable
    constraints {
      notNull
    }
  }
  fragment SqlSelectForDoltCellLookup on SqlSelect {
    queryString
    columns {
      ...ColumnForDoltCellLookup
    }
    rows {
      list {
        ...RowForDoltCellLookup
      }
    }
  }
`;

export const DOLT_CELL_DIFF = gql`
  ${DOLT_CELL_LOOKUP_FRAGMENT}
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
      ...SqlSelectForDoltCellLookup
    }
  }
`;

export const DOLT_CELL_HISTORY = gql`
  ${DOLT_CELL_LOOKUP_FRAGMENT}
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
      ...SqlSelectForDoltCellLookup
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
