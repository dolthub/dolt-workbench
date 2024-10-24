import { gql } from "@apollo/client";

export const DB_SCHEMAS = gql`
  query DatabaseSchemas($databaseName: String!, $refName: String!) {
    schemas(databaseName: $databaseName, refName: $refName)
  }
`;

export const CREATE_SCHEMA = gql`
  mutation CreateSchema(
    $databaseName: String!
    $schemaName: String!
    $refName: String!
  ) {
    createSchema(
      databaseName: $databaseName
      schemaName: $schemaName
      refName: $refName
    )
  }
`;
