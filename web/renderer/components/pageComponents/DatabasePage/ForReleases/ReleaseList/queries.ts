import { gql } from "@apollo/client";

export const DELETE_TAG_MUTATION = gql`
  mutation DeleteTag(
    $connectionName: String!
    $databaseName: String!
    $tagName: String!
  ) {
    deleteTag(
      connectionName: $connectionName
      databaseName: $databaseName
      tagName: $tagName
    )
  }
`;
