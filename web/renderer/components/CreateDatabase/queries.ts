import { gql } from "@apollo/client";

export const CREATE_DATABASE = gql`
  mutation CreateDatabase($databaseName: String!) {
    createDatabase(databaseName: $databaseName)
  }
`;

export const DOLT_CLONE = gql`
  mutation DoltClone($ownerName: String!, $databaseName: String!) {
    doltClone(ownerName: $ownerName, databaseName: $databaseName)
  }
`;
