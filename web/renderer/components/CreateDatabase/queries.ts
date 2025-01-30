import { gql } from "@apollo/client";

export const CREATE_DATABASE = gql`
  mutation CreateDatabase($name: String!, $databaseName: String!) {
    createDatabase(name: $name, databaseName: $databaseName)
  }
`;
