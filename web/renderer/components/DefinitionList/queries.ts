import { gql } from "@apollo/client";

export const ROWS_FOR_SCHEMAS = gql`
  fragment SchemaItem on SchemaItem {
    name
    type
  }
  query RowsForDoltSchemas(
    $name: String!
    $databaseName: String!
    $refName: String!
    $schemaName: String
  ) {
    doltSchemas(
      name: $name
      databaseName: $databaseName
      refName: $refName
      schemaName: $schemaName
    ) {
      ...SchemaItem
    }
  }
`;

export const ROWS_FOR_PROCEDURES = gql`
  query RowsForDoltProcedures(
    $name: String!
    $databaseName: String!
    $refName: String!
  ) {
    doltProcedures(
      name: $name
      databaseName: $databaseName
      refName: $refName
    ) {
      ...SchemaItem
    }
  }
`;
