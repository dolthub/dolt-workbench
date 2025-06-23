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
  fragment RowConflictList on RowConflictList {
    columns
    nextOffset
    list {
      ...RowConflict
    }
  }
  query PullRowConflicts(
    $databaseName: String!
    $fromBranchName: String!
    $toBranchName: String!
    $tableName: String!
    $offset: Int
  ) {
    pullRowConflicts(
      databaseName: $databaseName
      fromBranchName: $fromBranchName
      toBranchName: $toBranchName
      tableName: $tableName
      offset: $offset
    ) {
      ...RowConflictList
    }
  }
`;
