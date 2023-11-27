import { gql } from "@apollo/client";

export const ADD_DATABASE_CONNECTION = gql`
  mutation AddDatabaseConnection(
    $connectionUrl: String
    $useEnv: Boolean
    $hideDoltFeatures: Boolean
    $useSSL: Boolean
  ) {
    addDatabaseConnection(
      connectionUrl: $connectionUrl
      useEnv: $useEnv
      hideDoltFeatures: $hideDoltFeatures
      useSSL: $useSSL
    )
  }
`;

export const HAS_DB_ENV = gql`
  fragment StoredState on StoredState {
    connectionUrl
    useSSL
    hideDoltFeatures
  }
  query DatabaseState {
    databaseState {
      hasEnv
      storedState {
        ...StoredState
      }
    }
  }
`;
