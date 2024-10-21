import { gql } from "@apollo/client";

export const REF_PAGE_QUERY = gql`
  query RefPageQuery(
    $refName: String!
    $databaseName: String!
    $schemaName: String
    $filterSystemTables: Boolean
  ) {
    branch(databaseName: $databaseName, branchName: $refName) {
      _id
    }
    tableNames(
      refName: $refName
      databaseName: $databaseName
      schemaName: $schemaName
      filterSystemTables: $filterSystemTables
    ) {
      list
    }
  }
`;
