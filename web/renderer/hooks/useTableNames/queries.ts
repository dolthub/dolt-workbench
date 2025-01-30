import { gql } from "@apollo/client";

export const LIST_TABLE_NAMES = gql`
  query TableNames(
    $name: String!
    $databaseName: String!
    $refName: String!
    $schemaName: String
    $filterSystemTables: Boolean
  ) {
    tableNames(
      name: $name
      databaseName: $databaseName
      refName: $refName
      schemaName: $schemaName
      filterSystemTables: $filterSystemTables
    ) {
      list
    }
  }
`;
