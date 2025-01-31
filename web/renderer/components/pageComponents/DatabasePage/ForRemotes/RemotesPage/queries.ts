import { gql } from "@apollo/client";

export const REMOTES_FOR_REMOTES_PAGE_QUERY = gql`
  fragment Remote on Remote {
    _id
    name
    url
    fetchSpecs
  }
  query RemoteList(
    $connectionName: String!
    $databaseName: String!
    $offset: Int
  ) {
    remotes(
      connectionName: $connectionName
      databaseName: $databaseName
      offset: $offset
    ) {
      list {
        ...Remote
      }
      nextOffset
    }
  }
`;

export const DELETE_REMOTE = gql`
  mutation DeleteRemote(
    $connectionName: String!
    $remoteName: String!
    $databaseName: String!
  ) {
    deleteRemote(
      connectionName: $connectionName
      remoteName: $remoteName
      databaseName: $databaseName
    )
  }
`;

export const PULL_FROM_REMOTE = gql`
  fragment PullRes on PullRes {
    fastForward
    conflicts
    message
  }
  mutation PullFromRemote(
    $connectionName: String!
    $remoteName: String!
    $branchName: String!
    $databaseName: String!
    $refName: String!
  ) {
    pullFromRemote(
      connectionName: $connectionName
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
    $connectionName: String!
    $remoteName: String!
    $branchName: String!
    $databaseName: String!
    $refName: String!
  ) {
    pushToRemote(
      connectionName: $connectionName
      remoteName: $remoteName
      branchName: $branchName
      databaseName: $databaseName
      refName: $refName
    ) {
      ...PushRes
    }
  }
`;
