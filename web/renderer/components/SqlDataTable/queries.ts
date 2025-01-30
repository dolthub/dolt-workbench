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
    name:$String!
    $databaseName: String!
    $refName: String!
    $queryString: String!
    $schemaName: String
  ) {
    sqlSelect(
      name: $name
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
