import { gql } from "@apollo/client";

export const CREATE_TAG_MUTATION = gql`
  mutation CreateTag(
    $name: String!
    $databaseName: String!
    $tagName: String!
    $message: String
    $fromRefName: String!
    $author: AuthorInfo
  ) {
    createTag(
      name: $name
      databaseName: $databaseName
      tagName: $tagName
      message: $message
      fromRefName: $fromRefName
      author: $author
    )
  }
`;
