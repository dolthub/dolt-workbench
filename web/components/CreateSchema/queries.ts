import { gql } from "@apollo/client";

export const CREATE_SCHEMA = gql`
  mutation CreateSchema($schemaName: String!) {
    createSchema(schemaName: $schemaName)
  }
`;
