import { gql } from "@apollo/client";

export const SAVE_DOC = gql`
  mutation SaveDoc(
    $databaseName: String!
    $refName: String!
    $docType: DocType!
    $markdown: String!
  ) {
    saveDoc(
      databaseName: $databaseName
      refName: $refName
      docType: $docType
      markdown: $markdown
    ) {
      rowsAffected
      queryString
      executionMessage
    }
  }
`;

export const DELETE_DOC = gql`
  mutation DeleteDoc(
    $databaseName: String!
    $refName: String!
    $docType: DocType!
  ) {
    deleteDoc(
      databaseName: $databaseName
      refName: $refName
      docType: $docType
    ) {
      rowsAffected
      queryString
      executionMessage
    }
  }
`;
