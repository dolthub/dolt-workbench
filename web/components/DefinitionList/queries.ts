import { gql } from "@apollo/client";

export const ROWS_FOR_SCHEMAS = gql`
  fragment SchemaItem on SchemaItem {
    name
    type
  }
  query RowsForDoltSchemas(
    $databaseName: String!
    $refName: String!
    $schemaName: String
  ) {
    doltSchemas(
      databaseName: $databaseName
      refName: $refName
      schemaName: $schemaName
    ) {
      ...SchemaItem
    }
  }
`;

export const ROWS_FOR_PROCEDURES = gql`
  query RowsForDoltProcedures($databaseName: String!, $refName: String!) {
    doltProcedures(databaseName: $databaseName, refName: $refName) {
      ...SchemaItem
    }
  }
`;
