import { gql } from "@apollo/client";

export const ADD_DATABASE_CONNECTION = gql`
  mutation AddDatabaseConnection(
    $connectionUrl: String!
    $name: String!
    $hideDoltFeatures: Boolean
    $useSSL: Boolean
  ) {
    addDatabaseConnection(
      connectionUrl: $connectionUrl
      name: $name
      hideDoltFeatures: $hideDoltFeatures
      useSSL: $useSSL
    )
  }
`;

export const STORED_CONNECTIONS = gql`
  fragment DatabaseConnection on DatabaseConnection {
    connectionUrl
    name
    useSSL
    hideDoltFeatures
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
