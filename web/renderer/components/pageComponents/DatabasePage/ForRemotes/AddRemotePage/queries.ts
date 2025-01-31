import { gql } from "@apollo/client";

export const ADD_REMOTE = gql`
  mutation AddRemote(
    $connectionName: String!
    $databaseName: String!
    $remoteName: String!
    $remoteUrl: String!
  ) {
    addRemote(
      connectionName: $connectionName
      databaseName: $databaseName
      remoteName: $remoteName
      remoteUrl: $remoteUrl
    )
  }
`;
