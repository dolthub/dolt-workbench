import { gql } from "@apollo/client";

export const CREATE_DATABASE = gql`
  mutation CreateDatabase($connectionName: String!, $databaseName: String!) {
    createDatabase(connectionName: $connectionName, databaseName: $databaseName)
  }
`;
