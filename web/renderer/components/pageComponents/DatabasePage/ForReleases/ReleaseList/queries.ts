import { gql } from "@apollo/client";

export const DELETE_TAG_MUTATION = gql`
  mutation DeleteTag($databaseName: String!, $tagName: String!) {
    deleteTag(databaseName: $databaseName, tagName: $tagName)
  }
`;
