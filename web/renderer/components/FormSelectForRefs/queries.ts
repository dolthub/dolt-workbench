import { gql } from "@apollo/client";

export const BRANCH_SELECTOR_QUERY = gql`
  fragment BranchForBranchSelector on Branch {
    branchName
    databaseName
    remote
    remoteBranch
  }
  query BranchesForSelector($name: String!, $databaseName: String!) {
    allBranches(name: $name, databaseName: $databaseName) {
      ...BranchForBranchSelector
    }
  }
`;

export const TAG_LIST_QUERY = gql`
  fragment TagForList on Tag {
    _id
    tagName
    message
    taggedAt
    tagger {
      ...DoltWriterForHistory
    }
    commitId
  }
  fragment TagListForTagList on TagList {
    list {
      ...TagForList
    }
  }
  query TagList($name: String!, $databaseName: String!) {
    tags(name: $name, databaseName: $databaseName) {
      ...TagListForTagList
    }
  }
`;

export const TABLE_LIST_FOR_BRANCH_QUERY = gql`
  query TableNamesForBranch(
    $name: String!
    $databaseName: String!
    $refName: String!
    $schemaName: String
  ) {
    tableNames(
      name: $name
      databaseName: $databaseName
      refName: $refName
      schemaName: $schemaName
      filterSystemTables: true
    ) {
      list
    }
  }
`;
