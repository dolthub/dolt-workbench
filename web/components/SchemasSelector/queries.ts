import { gql } from "@apollo/client";

export const DB_SCHEMAS = gql`
  query DatabaseSchemas($databaseName: String!) {
    schemas(databaseName: $databaseName)
  }
`;

export const CREATE_SCHEMA = gql`
  mutation CreateSchema($databaseName: String!, $schemaName: String!) {
    createSchema(databaseName: $databaseName, schemaName: $schemaName)
  }
`;
