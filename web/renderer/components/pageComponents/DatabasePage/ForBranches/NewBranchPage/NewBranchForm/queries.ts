import { gql } from "@apollo/client";

export const CREATE_BRANCH = gql`
  mutation CreateBranch(
    $name: String!
    $newBranchName: String!
    $databaseName: String!
    $fromRefName: String!
  ) {
    createBranch(
      name: $name
      newBranchName: $newBranchName
      databaseName: $databaseName
      fromRefName: $fromRefName
    )
  }
`;
