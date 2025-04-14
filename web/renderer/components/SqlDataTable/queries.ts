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
  fragment RowListForSqlDataTableRows on RowList {
    nextOffset
    list {
      ...RowForSqlDataTable
    }
  }
  query SqlSelectForSqlDataTable(
    $databaseName: String!
    $refName: String!
    $queryString: String!
    $schemaName: String
    $offset: Int
  ) {
    sqlSelect(
      databaseName: $databaseName
      refName: $refName
      queryString: $queryString
      schemaName: $schemaName
      offset: $offset
    ) {
      queryExecutionStatus
      queryExecutionMessage
      columns {
        ...ColumnForSqlDataTable
      }
      rows {
        ...RowListForSqlDataTableRows
      }
      warnings
    }
  }
`;
