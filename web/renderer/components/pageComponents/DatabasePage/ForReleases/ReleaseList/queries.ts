import { gql } from "@apollo/client";

export const DELETE_TAG_MUTATION = gql`
  mutation DeleteTag(name:String! $databaseName: String!, $tagName: String!) {
    deleteTag(name:$name databaseName: $databaseName, tagName: $tagName)
  }
`;
