import { gql } from "@apollo/client";

export const ROWS_FOR_VIEWS = gql`
  fragment RowForSchemas on Row {
    columnValues {
      displayValue
    }
  }
  query RowsForViews($databaseName: String!, $refName: String!) {
    views(databaseName: $databaseName, refName: $refName) {
      list {
        ...RowForSchemas
      }
    }
  }
`;
