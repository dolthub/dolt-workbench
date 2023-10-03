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
  }
  query SqlSelectForSqlDataTable(
    $databaseName: String!
    $queryString: String!
  ) {
    sqlSelect(databaseName: $databaseName, queryString: $queryString) {
      _id
      queryExecutionStatus
      queryExecutionMessage
      columns {
        ...ColumnForSqlDataTable
      }
      rows {
        ...RowForSqlDataTable
      }
    }
  }
`;
