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
  query SqlSelectForSqlDataTable($queryString: String!) {
    sqlSelect(queryString: $queryString) {
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
