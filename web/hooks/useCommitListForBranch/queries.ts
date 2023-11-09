import { gql } from "@apollo/client";

export const HISTORY_FOR_BRANCH_QUERY = gql`
  fragment DoltWriterForHistory on DoltWriter {
    _id
    username
    displayName
    emailAddress
  }
  fragment CommitForHistory on Commit {
    _id
    committer {
      ...DoltWriterForHistory
    }
    message
    commitId
    committedAt
    parents
  }
  fragment CommitListForHistory on CommitList {
    list {
      ...CommitForHistory
    }
    nextOffset
  }
  query HistoryForBranch(
    $databaseName: String!
    $refName: String!
    $offset: Int
  ) {
    commits(databaseName: $databaseName, refName: $refName, offset: $offset) {
      ...CommitListForHistory
    }
  }
`;
