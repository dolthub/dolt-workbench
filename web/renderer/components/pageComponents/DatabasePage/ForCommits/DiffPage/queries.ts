import { gql } from "@apollo/client";

export const HISTORY_FOR_COMMIT = gql`
  fragment CommitForAfterCommitHistory on Commit {
    _id
    commitId
    parents
    message
    committedAt
    committer {
      _id
      displayName
      username
    }
  }
  query HistoryForCommit(
    $connectionName: String!
    $databaseName: String!
    $afterCommitId: String!
  ) {
    commits(
      connectionName: $connectionName
      afterCommitId: $afterCommitId
      databaseName: $databaseName
    ) {
      list {
        ...CommitForAfterCommitHistory
      }
    }
  }
`;
