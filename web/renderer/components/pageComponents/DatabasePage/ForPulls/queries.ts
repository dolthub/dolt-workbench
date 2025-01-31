import { gql } from "@apollo/client";

export const PULL_DETAILS_FOR_PULL_DETAILS = gql`
  fragment PullDetailCommit on PullDetailCommit {
    _id
    username
    message
    createdAt
    commitId
    parentCommitId
  }
  fragment PullDetailSummary on PullDetailSummary {
    _id
    username
    createdAt
    numCommits
  }
  fragment PullDetailsForPullDetails on PullDetails {
    ... on PullDetailCommit {
      ...PullDetailCommit
    }
    ... on PullDetailSummary {
      ...PullDetailSummary
    }
  }
  fragment PullDetails on PullWithDetails {
    _id
    state
    details {
      ...PullDetailsForPullDetails
    }
  }
  query PullDetailsForPullDetails(
    $connectionName: String!
    $databaseName: String!
    $fromBranchName: String!
    $toBranchName: String!
  ) {
    pullWithDetails(
      connectionName: $connectionName
      databaseName: $databaseName
      fromBranchName: $fromBranchName
      toBranchName: $toBranchName
    ) {
      ...PullDetails
    }
  }
`;
