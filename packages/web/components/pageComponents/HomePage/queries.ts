import { gql } from "@apollo/client";

export const ADD_DATABASE_CONNECTION = gql`
  mutation AddDatabaseConnection($url: String, $useEnv: Boolean) {
    addDatabaseConnection(url: $url, useEnv: $useEnv)
  }
`;

export const HAS_DB_ENV = gql`
  query HasDatabaseEnv {
    hasDatabaseEnv
  }
`;
