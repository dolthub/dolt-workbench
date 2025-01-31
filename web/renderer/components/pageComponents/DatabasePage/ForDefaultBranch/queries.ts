import { gql } from "@apollo/client";

export const DEFAULT_BRANCH_PAGE_QUERY = gql`
  query DefaultBranchPageQuery(
    $name: String!
    $databaseName: String!
    $schemaName: String
    $filterSystemTables: Boolean
  ) {
    defaultBranch(name: $name, databaseName: $databaseName) {
      _id
      branchName
      tableNames(
        schemaName: $schemaName
        filterSystemTables: $filterSystemTables
      )
    }
  }
`;
