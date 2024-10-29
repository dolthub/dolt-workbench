import { gql } from "@apollo/client";

export const COMMITS_FOR_DIFF_SELECTOR = gql`
  fragment CommitForDiffSelector on Commit {
    _id
    commitId
    message
    committedAt
    parents
    committer {
      _id
      displayName
      username
    }
  }
  fragment CommitListForDiffSelector on CommitList {
    list {
      ...CommitForDiffSelector
    }
  }
  query CommitsForDiffSelector($refName: String!, $databaseName: String!) {
    commits(refName: $refName, databaseName: $databaseName) {
      ...CommitListForDiffSelector
    }
  }
`;
