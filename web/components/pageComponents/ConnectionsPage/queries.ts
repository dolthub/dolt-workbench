import { gql } from "@apollo/client";

export const ADD_DATABASE_CONNECTION = gql`
  mutation AddDatabaseConnection(
    $connectionUrl: String!
    $name: String!
    $hideDoltFeatures: Boolean
    $useSSL: Boolean
    $type: DatabaseType
  ) {
    addDatabaseConnection(
      connectionUrl: $connectionUrl
      name: $name
      hideDoltFeatures: $hideDoltFeatures
      useSSL: $useSSL
      type: $type
    ) {
      currentDatabase
    }
  }
`;

export const STORED_CONNECTIONS = gql`
  fragment DatabaseConnection on DatabaseConnection {
    connectionUrl
    name
    useSSL
    hideDoltFeatures
    type
    isDolt
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
