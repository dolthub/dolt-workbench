import { gql } from "@apollo/client";

export const GET_TAG_QUERY = gql`
  query GetTag(
    $connectionName: String!
    $databaseName: String!
    $tagName: String!
  ) {
    tag(
      connectionName: $connectionName
      databaseName: $databaseName
      tagName: $tagName
    ) {
      ...TagForList
    }
  }
`;

export const GET_BRANCH = gql`
  query GetBranch(
    $connectionName: String!
    $branchName: String!
    $databaseName: String!
  ) {
    branch(
      connectionName: $connectionName
      branchName: $branchName
      databaseName: $databaseName
    ) {
      _id
    }
  }
`;
