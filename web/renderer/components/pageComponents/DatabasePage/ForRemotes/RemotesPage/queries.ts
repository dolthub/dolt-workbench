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

export const DELETE_REMOTE = gql`
  mutation DeleteRemote($remoteName: String!, $databaseName: String!) {
    deleteRemote(remoteName: $remoteName, databaseName: $databaseName)
  }
`;

export const PULL_FROM_REMOTE = gql`
  fragment PullRes on PullRes {
    fastForward
    conflicts
    message
  }
  mutation PullFromRemote(
    $remoteName: String!
    $branchName: String!
    $databaseName: String!
    $refName: String!
  ) {
    pullFromRemote(
      remoteName: $remoteName
      branchName: $branchName
      databaseName: $databaseName
      refName: $refName
    ) {
      ...PullRes
    }
  }
`;

export const PUSH_TO_REMOTE = gql`
  fragment PushRes on PushRes {
    success
    message
  }
  mutation PushToRemote(
    $remoteName: String!
    $branchName: String!
    $databaseName: String!
    $refName: String!
  ) {
    pushToRemote(
      remoteName: $remoteName
      branchName: $branchName
      databaseName: $databaseName
      refName: $refName
    ) {
      ...PushRes
    }
  }
`;
