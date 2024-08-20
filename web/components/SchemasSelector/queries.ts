import { gql } from "@apollo/client";

export const DB_SCHEMAS = gql`
  query DatabaseSchemas {
    schemas
  }
`;

export const CREATE_SCHEMA = gql`
  mutation CreateSchema($schemaName: String!) {
    createSchema(schemaName: $schemaName)
  }
`;
