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
  query HistoryForCommit(    name:String!
    $databaseName: String!, $afterCommitId: String!) {
    commits(name:$name afterCommitId: $afterCommitId, databaseName: $databaseName) {
      list {
        ...CommitForAfterCommitHistory
      }
    }
  }
`;
