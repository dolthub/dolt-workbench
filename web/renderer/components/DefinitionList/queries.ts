import { gql } from "@apollo/client";

export const ROWS_FOR_SCHEMAS = gql`
  fragment SchemaItem on SchemaItem {
    name
    type
  }
  query RowsForDoltSchemas(
    $connectionName: String!
    $databaseName: String!
    $refName: String!
    $schemaName: String
  ) {
    doltSchemas(
      connectionName: $connectionName
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
    $connectionName: String!
    $databaseName: String!
    $refName: String!
  ) {
    doltProcedures(
      connectionName: $connectionName
      databaseName: $databaseName
      refName: $refName
    ) {
      ...SchemaItem
    }
  }
`;
