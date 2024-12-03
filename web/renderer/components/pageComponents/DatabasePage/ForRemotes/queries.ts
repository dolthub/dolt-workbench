import { gql } from "@apollo/client";

export const REMOTES_FOR_REMOTES_PAGE_QUERY = gql`
  fragment Remote on Remote {
    _id
    name
    url
    fetchSpecs
  }
  query RemoteList($databaseName: String!, $offset: Int) {
    remotes(databaseName: $databaseName, offset: $offset) {
      list {
        ...Remote
      }
      nextOffset
    }
  }
`;

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

export const DELETE_REMOTE = gql`
  mutation DeleteRemote($remoteName: String!, $databaseName: String!) {
    deleteRemote(remoteName: $remoteName, databaseName: $databaseName)
  }
`;
