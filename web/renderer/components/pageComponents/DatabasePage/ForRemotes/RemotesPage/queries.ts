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
  ) {
    pullFromRemote(
      remoteName: $remoteName
      branchName: $branchName
      databaseName: $databaseName
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
  ) {
    pushToRemote(
      remoteName: $remoteName
      branchName: $branchName
      databaseName: $databaseName
    ) {
      ...PushRes
    }
  }
`;

export const FETCH_REMOTE = gql`
  fragment FetchRes on FetchRes {
    success
  }
  mutation FetchRemote(
    $remoteName: String!
    $databaseName: String!
    $branchName: String
  ) {
    fetchRemote(
      remoteName: $remoteName
      databaseName: $databaseName
      branchName: $branchName
    ) {
      ...FetchRes
    }
  }
`;
