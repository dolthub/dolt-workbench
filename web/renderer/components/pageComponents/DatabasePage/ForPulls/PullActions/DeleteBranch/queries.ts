import { gql } from "@apollo/client";

export const GET_BRANCH_FOR_PULL = gql`
  query GetBranchForPull(
    $name: String!
    $branchName: String!
    $databaseName: String!
  ) {
    branch(name: $name, branchName: $branchName, databaseName: $databaseName) {
      _id
    }
  }
`;
