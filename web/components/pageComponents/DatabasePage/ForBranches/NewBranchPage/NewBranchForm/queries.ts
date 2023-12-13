import { gql } from "@apollo/client";

export const CREATE_BRANCH = gql`
  mutation CreateBranch(
    $newBranchName: String!
    $databaseName: String!
    $fromRefName: String!
  ) {
    createBranch(
      newBranchName: $newBranchName
      databaseName: $databaseName
      fromRefName: $fromRefName
    )
  }
`;
