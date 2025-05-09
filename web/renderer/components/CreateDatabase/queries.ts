import { gql } from "@apollo/client";

export const CREATE_DATABASE = gql`
  mutation CreateDatabase($databaseName: String!) {
    createDatabase(databaseName: $databaseName)
  }
`;

export const DOLT_CLONE = gql`
  mutation DoltClone(
    $ownerName: String!
    $remoteDbName: String!
    $databaseName: String!
  ) {
    doltClone(
      ownerName: $ownerName
      remoteDbName: $remoteDbName
      databaseName: $databaseName
    )
  }
`;
