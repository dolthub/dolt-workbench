import { gql } from "@apollo/client";

export const REF_PAGE_QUERY = gql`
  query RefPageQuery(
    $connectionName: String!
    $refName: String!
    $databaseName: String!
    $schemaName: String
    $filterSystemTables: Boolean
  ) {
    branch(
      connectionName: $connectionName
      databaseName: $databaseName
      branchName: $refName
    ) {
      _id
    }
    tableNames(
      connectionName: $connectionName
      refName: $refName
      databaseName: $databaseName
      schemaName: $schemaName
      filterSystemTables: $filterSystemTables
    ) {
      list
    }
  }
`;
