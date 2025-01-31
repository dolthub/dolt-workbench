import { gql } from "@apollo/client";

export const DEFAULT_BRANCH_PAGE_QUERY = gql`
  query DefaultBranchPageQuery(
    $connectionName: String!
    $databaseName: String!
    $schemaName: String
    $filterSystemTables: Boolean
  ) {
    defaultBranch(
      connectionName: $connectionName
      databaseName: $databaseName
    ) {
      _id
      branchName
      tableNames(
        schemaName: $schemaName
        filterSystemTables: $filterSystemTables
      )
    }
  }
`;
