import { gql } from "@apollo/client";

export const ADD_DATABASE_CONNECTION = gql`
  mutation AddDatabaseConnection(
    $url: String
    $useEnv: Boolean
    $hideDoltFeatures: Boolean
    $useSSL: Boolean
    $shouldStore: Boolean
  ) {
    addDatabaseConnection(
      url: $url
      useEnv: $useEnv
      hideDoltFeatures: $hideDoltFeatures
      useSSL: $useSSL
      shouldStore: $shouldStore
    )
  }
`;

export const HAS_DB_ENV = gql`
  query DatabaseState {
    databaseState {
      hasEnv
      storedState {
        connectionUrl
        useSSL
        hideDoltFeatures
      }
    }
  }
`;
