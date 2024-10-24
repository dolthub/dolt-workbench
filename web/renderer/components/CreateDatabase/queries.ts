import { gql } from "@apollo/client";

export const CREATE_DATABASE = gql`
  mutation CreateDatabase($databaseName: String!) {
    createDatabase(databaseName: $databaseName)
  }
`;
