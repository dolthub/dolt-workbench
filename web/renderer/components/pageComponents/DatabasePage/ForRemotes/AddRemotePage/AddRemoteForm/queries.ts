import { gql } from "@apollo/client";

export const CREATE_BRANCH = gql`
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

export const DELETE_REMOTE = gql`
  mutation DeleteRemote($remoteName: String!, $databaseName: String!) {
    deleteRemote(remoteName: $remoteName, databaseName: $databaseName)
  }
`;
