import { gql } from "@apollo/client";

export const GET_TAG_QUERY = gql`
  query GetTag($name: String!, $databaseName: String!, $tagName: String!) {
    tag(name: $name, databaseName: $databaseName, tagName: $tagName) {
      ...TagForList
    }
  }
`;

export const GET_BRANCH = gql`
  query GetBranch(
    $name: String!
    $branchName: String!
    $databaseName: String!
  ) {
    branch(name: $name, branchName: $branchName, databaseName: $databaseName) {
      _id
    }
  }
`;
