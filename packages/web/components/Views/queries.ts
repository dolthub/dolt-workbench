import { gql } from "@apollo/client";

export const ROWS_FOR_VIEWS = gql`
  query RowsForViews($databaseName: String!, $refName: String!) {
    views(databaseName: $databaseName, refName: $refName) {
      ...SchemaItem
    }
  }
`;
