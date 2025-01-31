import { gql } from "@apollo/client";

export const CREATE_BRANCH = gql`
  mutation CreateBranch(
    $connectionName: String!
    $newBranchName: String!
    $databaseName: String!
    $fromRefName: String!
  ) {
    createBranch(
      connectionName: $connectionName
      newBranchName: $newBranchName
      databaseName: $databaseName
      fromRefName: $fromRefName
    )
  }
`;
