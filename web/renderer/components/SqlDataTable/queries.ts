import { gql } from "@apollo/client";

export const SQL_SELECT_QUERY = gql`
  fragment RowForSqlDataTable on Row {
    columnValues {
      displayValue
    }
  }
  fragment ColumnForSqlDataTable on Column {
    name
    isPrimaryKey
    type
    sourceTable
  }
  query SqlSelectForSqlDataTable(
    $connectionName: String!
    $databaseName: String!
    $refName: String!
    $queryString: String!
    $schemaName: String
  ) {
    sqlSelect(
      connectionName: $connectionName
      databaseName: $databaseName
      refName: $refName
      queryString: $queryString
      schemaName: $schemaName
    ) {
      queryExecutionStatus
      queryExecutionMessage
      columns {
        ...ColumnForSqlDataTable
      }
      rows {
        ...RowForSqlDataTable
      }
      warnings
    }
  }
`;
