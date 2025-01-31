import { gql } from "@apollo/client";

export const BRANCH_LIST_FOR_COMMIT_GRAPH_QUERY = gql`
  fragment BranchForCommitGraph on Branch {
    branchName
    head
  }
  query BranchListForCommitGraph(
    $connectionName: String!
    $databaseName: String!
    $offset: Int
  ) {
    branches(
      connectionName: $connectionName
      databaseName: $databaseName
      offset: $offset
    ) {
      list {
        ...BranchForCommitGraph
      }
      nextOffset
    }
  }
`;
