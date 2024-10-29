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
  query HistoryForCommit($databaseName: String!, $afterCommitId: String!) {
    commits(afterCommitId: $afterCommitId, databaseName: $databaseName) {
      list {
        ...CommitForAfterCommitHistory
      }
    }
  }
`;
