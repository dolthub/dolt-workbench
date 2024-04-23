import { gql } from "@apollo/client";

export const MERGE_PULL = gql`
  mutation MergePull(
    $databaseName: String!
    $fromBranchName: String!
    $toBranchName: String!
    $author: AuthorInfo
  ) {
    mergePull(
      databaseName: $databaseName
      fromBranchName: $fromBranchName
      toBranchName: $toBranchName
      author: $author
    )
  }
`;
