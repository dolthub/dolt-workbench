import { gql } from "@apollo/client";

export const CREATE_TAG_MUTATION = gql`
  mutation CreateTag(
    $databaseName: String!
    $tagName: String!
    $message: String
    $fromRefName: String!
    $author: AuthorInfo
  ) {
    createTag(
      databaseName: $databaseName
      tagName: $tagName
      message: $message
      fromRefName: $fromRefName
      author: $author
    )
  }
`;
