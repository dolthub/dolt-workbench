import { gql } from "@apollo/client";

export const BRANCH_SELECTOR_QUERY = gql`
  fragment BranchForBranchSelector on Branch {
    connectionName
    branchName
    databaseName
    remote
    remoteBranch
  }
  query BranchesForSelector($connectionName: String!, $databaseName: String!) {
    allBranches(connectionName: $connectionName, databaseName: $databaseName) {
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
  query TagList($connectionName: String!, $databaseName: String!) {
    tags(connectionName: $connectionName, databaseName: $databaseName) {
      ...TagListForTagList
    }
  }
`;

export const TABLE_LIST_FOR_BRANCH_QUERY = gql`
  query TableNamesForBranch(
    $connectionName: String!
    $databaseName: String!
    $refName: String!
    $schemaName: String
  ) {
    tableNames(
      connectionName: $connectionName
      databaseName: $databaseName
      refName: $refName
      schemaName: $schemaName
      filterSystemTables: true
    ) {
      list
    }
  }
`;
