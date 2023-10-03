import { gql } from "@apollo/client";

export const TABLE_NAMES = gql`
  query TableNames($databaseName: String!) {
    tableNames(databaseName: $databaseName) {
      list
    }
  }
`;
