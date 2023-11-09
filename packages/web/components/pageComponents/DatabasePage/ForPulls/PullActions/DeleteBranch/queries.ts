import { gql } from "@apollo/client";

export const GET_BRANCH_FOR_PULL = gql`
  query GetBranchForPull($branchName: String!, $databaseName: String!) {
    branch(branchName: $branchName, databaseName: $databaseName) {
      _id
    }
  }
`;
