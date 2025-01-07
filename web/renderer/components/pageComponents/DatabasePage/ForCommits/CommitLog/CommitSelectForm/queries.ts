import { gql } from "@apollo/client";

export const COMMIT_SELECTOR_QUERY = gql`
  fragment CommitForCommitSelector on Commit {
    _id
    commitId
  }

  query CommitsForSelector($databaseName: String!, $refName: String!) {
    allCommits(databaseName: $databaseName, refName: $refName) {
      ...CommitForCommitSelector
    }
  }
`;
