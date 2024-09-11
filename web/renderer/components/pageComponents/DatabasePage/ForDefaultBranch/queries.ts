import { gql } from "@apollo/client";

export const DEFAULT_BRANCH_PAGE_QUERY = gql`
  query DefaultBranchPageQuery(
    $databaseName: String!
    $schemaName: String
    $filterSystemTables: Boolean
  ) {
    defaultBranch(databaseName: $databaseName) {
      _id
      branchName
      tableNames(
        schemaName: $schemaName
        filterSystemTables: $filterSystemTables
      )
    }
  }
`;
