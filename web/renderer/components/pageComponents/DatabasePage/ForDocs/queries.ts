import { gql } from "@apollo/client";

export const DOC_DATA_FOR_DOC_PAGE = gql`
  fragment DocColumnValuesForDocPage on Row {
    columnValues {
      displayValue
    }
  }
  query DocDataForDocPage(
    $connectionName: String!
    $databaseName: String!
    $refName: String!
    $docType: DocType
  ) {
    docOrDefaultDoc(
      connectionName: $connectionName
      databaseName: $databaseName
      refName: $refName
      docType: $docType
    ) {
      docRow {
        ...DocColumnValuesForDocPage
      }
    }
  }
`;

export const DOC_PAGE_QUERY_NO_BRANCH = gql`
  query DocPageQueryNoBranch($connectionName: String!, $databaseName: String!) {
    branchOrDefault(
      connectionName: $connectionName
      databaseName: $databaseName
    ) {
      _id
      branchName
    }
  }
`;
