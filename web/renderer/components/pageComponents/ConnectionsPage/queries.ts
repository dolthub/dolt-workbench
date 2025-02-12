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
  ) {
    addDatabaseConnection(
      connectionUrl: $connectionUrl
      name: $name
      hideDoltFeatures: $hideDoltFeatures
      useSSL: $useSSL
      type: $type
      isLocalDolt: $isLocalDolt
      port: $port
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
