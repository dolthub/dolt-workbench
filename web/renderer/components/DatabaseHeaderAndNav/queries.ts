import { gql } from "@apollo/client";

export const CURRENT_DATABASE = gql`
  query CurrentDatabase($connectionName: String!) {
    currentDatabase(connectionName: $connectionName)
  }
`;

export const RESET_DATABASE = gql`
  mutation ResetDatabase($newDatabase: String) {
    resetDatabase(newDatabase: $newDatabase)
  }
`;

export const CURRENT_CONNECTION = gql`
  query CurrentConnection {
    currentConnection {
      connectionUrl
      connectionName
      hideDoltFeatures
      useSSL
      type
      isDolt
    }
  }
`;

export const DATABASES_BY_CONNECTION = gql`
  query DatabasesByConnection(
    $connectionUrl: String!
    $connectionName: String!
    $hideDoltFeatures: Boolean
    $useSSL: Boolean
    $type: DatabaseType
  ) {
    databasesByConnection(
      connectionUrl: $connectionUrl
      connectionName: $connectionName
      hideDoltFeatures: $hideDoltFeatures
      useSSL: $useSSL
      type: $type
    )
  }
`;
