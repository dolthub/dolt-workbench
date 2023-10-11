import { gql } from "@apollo/client";

export const LIST_TABLE_NAMES = gql`
  query TableNames(
    $databaseName: String!
    $refName: String!
    $filterSystemTables: Boolean
  ) {
    tableNames(
      databaseName: $databaseName
      refName: $refName
      filterSystemTables: $filterSystemTables
    ) {
      list
    }
  }
`;
