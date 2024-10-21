import { gql } from "@apollo/client";

export const BRANCH_SELECTOR_QUERY = gql`
  fragment BranchForBranchSelector on Branch {
    branchName
    databaseName
  }
  query BranchesForSelector($databaseName: String!) {
    allBranches(databaseName: $databaseName) {
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
  query TagList($databaseName: String!) {
    tags(databaseName: $databaseName) {
      ...TagListForTagList
    }
  }
`;

export const TABLE_LIST_FOR_BRANCH_QUERY = gql`
  query TableNamesForBranch(
    $databaseName: String!
    $refName: String!
    $schemaName: String
  ) {
    tableNames(
      databaseName: $databaseName
      refName: $refName
      schemaName: $schemaName
      filterSystemTables: true
    ) {
      list
    }
  }
`;
