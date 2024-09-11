import { gql } from "@apollo/client";

export const ADD_DATABASE_CONNECTION = gql`
  mutation AddDatabaseConnection(
    $connectionUrl: String!
    $name: String!
    $hideDoltFeatures: Boolean
    $useSSL: Boolean
    $type: DatabaseType
    $schema: String
  ) {
    addDatabaseConnection(
      connectionUrl: $connectionUrl
      name: $name
      hideDoltFeatures: $hideDoltFeatures
      useSSL: $useSSL
      type: $type
      schema: $schema
    ) {
      currentDatabase
      currentSchema
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
    schema
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
