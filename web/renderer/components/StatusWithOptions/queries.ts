import { gql } from "@apollo/client";

export const GET_STATUS = gql`
  fragment Status on Status {
    _id
    refName
    tableName
    staged
    status
  }
  query GetStatus(
    $connectionName: String!
    $databaseName: String!
    $refName: String!
  ) {
    status(
      connectionName: $connectionName
      databaseName: $databaseName
      refName: $refName
    ) {
      ...Status
    }
  }
`;

export const RESTORE_ALL = gql`
  mutation RestoreAll(
    $connectionName: String!
    $databaseName: String!
    $refName: String!
  ) {
    restoreAllTables(
      connectionName: $connectionName
      databaseName: $databaseName
      refName: $refName
    )
  }
`;
