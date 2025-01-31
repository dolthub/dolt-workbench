import { gql } from "@apollo/client";

export const ROWS_FOR_VIEWS = gql`
  query RowsForViews(
    $connectionName: String!
    $databaseName: String!
    $refName: String!
    $schemaName: String
  ) {
    views(
      connectionName: $connectionName
      databaseName: $databaseName
      refName: $refName
      schemaName: $schemaName
    ) {
      ...SchemaItem
    }
  }
`;
