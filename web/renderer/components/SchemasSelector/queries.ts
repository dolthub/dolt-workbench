import { gql } from "@apollo/client";

export const DB_SCHEMAS = gql`
  query DatabaseSchemas(
    $connectionName: String!
    $databaseName: String!
    $refName: String!
  ) {
    schemas(
      connectionName: $connectionName
      databaseName: $databaseName
      refName: $refName
    )
  }
`;

export const CREATE_SCHEMA = gql`
  mutation CreateSchema(
    $connectionName: String!
    $databaseName: String!
    $schemaName: String!
    $refName: String!
  ) {
    createSchema(
      connectionName: $connectionName
      databaseName: $databaseName
      schemaName: $schemaName
      refName: $refName
    )
  }
`;
