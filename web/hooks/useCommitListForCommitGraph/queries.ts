import { gql } from "@apollo/client";

export const BRANCH_LIST_FOR_COMMIT_GRAPH_QUERY = gql`
  fragment BranchForCommitGraph on Branch {
    branchName
    head
  }
  query BranchListForCommitGraph($databaseName: String!) {
    branches(databaseName: $databaseName) {
      list {
        ...BranchForCommitGraph
      }
    }
  }
`;
