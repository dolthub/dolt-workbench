import { gql } from "@apollo/client";

export const TABLE_NAMES = gql`
  query TableNames($databaseName: String!, $refName: String!) {
    tableNames(databaseName: $databaseName, refName: $refName) {
      list
    }
  }
`;
