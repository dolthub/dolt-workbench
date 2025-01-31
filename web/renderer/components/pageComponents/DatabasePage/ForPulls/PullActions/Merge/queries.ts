import { gql } from "@apollo/client";

export const MERGE_PULL = gql`
  mutation MergePull(
    $connectionName: String!
    $databaseName: String!
    $fromBranchName: String!
    $toBranchName: String!
    $author: AuthorInfo
  ) {
    mergePull(
      connectionName: $connectionName
      databaseName: $databaseName
      fromBranchName: $fromBranchName
      toBranchName: $toBranchName
      author: $author
    )
  }
`;
