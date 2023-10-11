import { gql } from "@apollo/client";

export const ROWS_FOR_VIEWS = gql`
  fragment RowForViews on Row {
    columnValues {
      displayValue
    }
  }
  query RowsForViews($databaseName: String!, $refName: String!) {
    views(databaseName: $databaseName, refName: $refName) {
      list {
        ...RowForViews
      }
    }
  }
`;
