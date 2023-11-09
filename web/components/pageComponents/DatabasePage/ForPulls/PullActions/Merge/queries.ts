import { gql } from "@apollo/client";

export const MERGE_PULL = gql`
  mutation MergePull(
    $databaseName: String!
    $fromBranchName: String!
    $toBranchName: String!
  ) {
    mergePull(
      databaseName: $databaseName
      fromBranchName: $fromBranchName
      toBranchName: $toBranchName
    )
  }
`;
