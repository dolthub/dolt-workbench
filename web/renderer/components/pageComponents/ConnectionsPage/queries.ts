import { gql } from "@apollo/client";

export const ADD_DATABASE_CONNECTION = gql`
  mutation AddDatabaseConnection(
    $connectionUrl: String!
    $name: String!
    $hideDoltFeatures: Boolean
    $useSSL: Boolean
    $type: DatabaseType
    $isLocalDolt: Boolean
    $port: String
    $certificateAuthority: String
    $clientCert: String
    $clientKey: String
  ) {
    addDatabaseConnection(
      connectionUrl: $connectionUrl
      name: $name
      hideDoltFeatures: $hideDoltFeatures
      useSSL: $useSSL
      type: $type
      isLocalDolt: $isLocalDolt
      port: $port
      certificateAuthority: $certificateAuthority
      clientCert: $clientCert
      clientKey: $clientKey
    ) {
      currentDatabase
    }
  }
`;

export const STORED_CONNECTIONS = gql`
  fragment DatabaseConnection on DatabaseConnection {
    connectionUrl
    name
    port
    useSSL
    hideDoltFeatures
    type
    isDolt
    isLocalDolt
    certificateAuthority
    clientCert
    clientKey
  }
  query StoredConnections {
    storedConnections {
      ...DatabaseConnection
    }
  }
`;

export const REMOVE_CONNECTION = gql`
  mutation RemoveConnection($name: String!) {
    removeDatabaseConnection(name: $name)
  }
`;
