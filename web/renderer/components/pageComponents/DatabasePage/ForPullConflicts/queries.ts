import { gql } from "@apollo/client";

export const PULL_ROW_CONFLICTS = gql`
  fragment RowConflict on RowConflict {
    base {
      ...RowForTableList
    }
    ours {
      ...RowForTableList
    }
    theirs {
      ...RowForTableList
    }
  }
  query PullRowConflicts(
    $databaseName: String!
    $fromBranchName: String!
    $toBranchName: String!
    $tableName: String!
  ) {
    pullRowConflicts(
      databaseName: $databaseName
      fromBranchName: $fromBranchName
      toBranchName: $toBranchName
      tableName: $tableName
    ) {
      columns
      list {
        ...RowConflict
      }
    }
  }
`;
