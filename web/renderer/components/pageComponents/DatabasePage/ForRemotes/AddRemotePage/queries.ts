import { gql } from "@apollo/client";

export const ADD_REMOTE = gql`
  mutation AddRemote(
    $databaseName: String!
    $remoteName: String!
    $remoteUrl: String!
  ) {
    addRemote(
      databaseName: $databaseName
      remoteName: $remoteName
      remoteUrl: $remoteUrl
    )
  }
`;
