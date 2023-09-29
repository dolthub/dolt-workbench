import { gql } from "@apollo/client";

export const ADD_DATABASE_CONNECTION = gql`
  mutation AddDatabaseConnection($url: String!) {
    addDatabaseConnection(url: $url)
  }
`;
