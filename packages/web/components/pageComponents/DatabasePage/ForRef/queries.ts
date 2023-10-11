import { gql } from "@apollo/client";

export const REF_PAGE_QUERY = gql`
  query RefPageQuery(
    $refName: String!
    $databaseName: String!
    $filterSystemTables: Boolean
  ) {
    branch(databaseName: $databaseName, branchName: $refName) {
      _id
    }
    tableNames(
      refName: $refName
      databaseName: $databaseName
      filterSystemTables: $filterSystemTables
    ) {
      list
    }
  }
`;
