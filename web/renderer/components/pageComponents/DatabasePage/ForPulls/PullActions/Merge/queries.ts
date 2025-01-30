import { gql } from "@apollo/client";

export const MERGE_PULL = gql`
  mutation MergePull(
    $name: String!
    $databaseName: String!
    $fromBranchName: String!
    $toBranchName: String!
    $author: AuthorInfo
  ) {
    mergePull(
      name: $name
      databaseName: $databaseName
      fromBranchName: $fromBranchName
      toBranchName: $toBranchName
      author: $author
    )
  }
`;
