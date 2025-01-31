import { gql } from "@apollo/client";

export const LIST_TABLE_NAMES = gql`
  query TableNames(
    $connectionName: String!
    $databaseName: String!
    $refName: String!
    $schemaName: String
    $filterSystemTables: Boolean
  ) {
    tableNames(
      connectionName: $connectionName
      databaseName: $databaseName
      refName: $refName
      schemaName: $schemaName
      filterSystemTables: $filterSystemTables
    ) {
      list
    }
  }
`;
