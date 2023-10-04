import { gql } from "@apollo/client";

export const BRANCH_SELECTOR_QUERY = gql`
  fragment BranchForBranchSelector on Branch {
    branchName
    databaseName
  }
  query BranchesForSelector($databaseName: String!) {
    branches(databaseName: $databaseName) {
      list {
        ...BranchForBranchSelector
      }
    }
  }
`;
