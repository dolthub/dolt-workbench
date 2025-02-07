import { gql } from "@apollo/client";

export const CURRENT_DATABASE = gql`
  query CurrentDatabase {
    currentDatabase
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
      name
      hideDoltFeatures
      useSSL
      type
      isDolt
      isLocalDolt
    }
  }
`;

export const DATABASES_BY_CONNECTION = gql`
  query DatabasesByConnection(
    $connectionUrl: String!
    $name: String!
    $hideDoltFeatures: Boolean
    $useSSL: Boolean
    $type: DatabaseType
  ) {
    databasesByConnection(
      connectionUrl: $connectionUrl
      name: $name
      hideDoltFeatures: $hideDoltFeatures
      useSSL: $useSSL
      type: $type
    )
  }
`;
