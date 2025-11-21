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
      port
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
    $certificateAuthority: String
    $clientCert: String
    $clientKey: String
  ) {
    databasesByConnection(
      connectionUrl: $connectionUrl
      name: $name
      hideDoltFeatures: $hideDoltFeatures
      useSSL: $useSSL
      type: $type
      certificateAuthority: $certificateAuthority
      clientCert: $clientCert
      clientKey: $clientKey
    )
  }
`;

export const DOLT_SERVER_STATUS = gql`
  query DoltServerStatus(
    $connectionUrl: String!
    $name: String!
    $hideDoltFeatures: Boolean
    $useSSL: Boolean
    $type: DatabaseType
  ) {
    doltServerStatus(
      connectionUrl: $connectionUrl
      name: $name
      hideDoltFeatures: $hideDoltFeatures
      useSSL: $useSSL
      type: $type
    ) {
      active
    }
  }
`;
