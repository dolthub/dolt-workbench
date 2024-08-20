import { gql } from "@apollo/client";

export const ROWS_FOR_VIEWS = gql`
  query RowsForViews(
    $databaseName: String!
    $refName: String!
    $schemaName: String
  ) {
    views(
      databaseName: $databaseName
      refName: $refName
      schemaName: $schemaName
    ) {
      ...SchemaItem
    }
  }
`;
