import { gql } from "@apollo/client";

export const DB_SCHEMAS = gql`
  query DatabaseSchemas(
    $name: String!
    $databaseName: String!
    $refName: String!
  ) {
    schemas(name: $name, databaseName: $databaseName, refName: $refName)
  }
`;

export const CREATE_SCHEMA = gql`
  mutation CreateSchema(
    $name: String!
    $databaseName: String!
    $schemaName: String!
    $refName: String!
  ) {
    createSchema(
      name: $name
      databaseName: $databaseName
      schemaName: $schemaName
      refName: $refName
    )
  }
`;
