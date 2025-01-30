import { gql } from "@apollo/client";

export const REF_PAGE_QUERY = gql`
  query RefPageQuery(
    name:$String!
    $refName: String!
    $databaseName: String!
    $schemaName: String
    $filterSystemTables: Boolean
  ) {
    branch(name:$name databaseName: $databaseName, branchName: $refName) {
      _id
    }
    tableNames(
      name:$name
      refName: $refName
      databaseName: $databaseName
      schemaName: $schemaName
      filterSystemTables: $filterSystemTables
    ) {
      list
    }
  }
`;
