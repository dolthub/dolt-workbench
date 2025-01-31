import { gql } from "@apollo/client";

export const GET_BRANCH_FOR_PULL = gql`
  query GetBranchForPull(
    $connectionName: String!
    $branchName: String!
    $databaseName: String!
  ) {
    branch(
      connectionName: $connectionName
      branchName: $branchName
      databaseName: $databaseName
    ) {
      _id
    }
  }
`;
