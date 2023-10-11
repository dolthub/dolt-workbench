import { gql } from "@apollo/client";

export const GET_TAG_QUERY = gql`
  query GetTag($databaseName: String!, $tagName: String!) {
    tag(databaseName: $databaseName, tagName: $tagName) {
      ...TagForList
    }
  }
`;

export const GET_BRANCH = gql`
  query GetBranch($branchName: String!, $databaseName: String!) {
    branch(branchName: $branchName, databaseName: $databaseName) {
      _id
    }
  }
`;
