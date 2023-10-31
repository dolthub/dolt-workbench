import { gql } from "@apollo/client";

export const ADD_DATABASE_CONNECTION = gql`
  mutation AddDatabaseConnection(
    $url: String
    $useEnv: Boolean
    $hideDoltFeatures: Boolean
  ) {
    addDatabaseConnection(
      url: $url
      useEnv: $useEnv
      hideDoltFeatures: $hideDoltFeatures
    )
  }
`;

export const HAS_DB_ENV = gql`
  query HasDatabaseEnv {
    hasDatabaseEnv
  }
`;
