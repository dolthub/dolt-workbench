import { gql } from "@apollo/client";

export const CREATE_TAG_MUTATION = gql`
  mutation CreateTag(
    $connectionName: String!
    $databaseName: String!
    $tagName: String!
    $message: String
    $fromRefName: String!
    $author: AuthorInfo
  ) {
    createTag(
      connectionName: $connectionName
      databaseName: $databaseName
      tagName: $tagName
      message: $message
      fromRefName: $fromRefName
      author: $author
    )
  }
`;
