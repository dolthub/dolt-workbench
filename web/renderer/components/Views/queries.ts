import { gql } from "@apollo/client";

export const ROWS_FOR_VIEWS = gql`
  query RowsForViews(
    name:$String!
    $databaseName: String!
    $refName: String!
    $schemaName: String
  ) {
    views(
      name: $name
      databaseName: $databaseName
      refName: $refName
      schemaName: $schemaName
    ) {
      ...SchemaItem
    }
  }
`;
