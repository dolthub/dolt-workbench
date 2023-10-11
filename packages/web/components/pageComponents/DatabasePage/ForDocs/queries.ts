import { gql } from "@apollo/client";

export const DOC_DATA_FOR_DOC_PAGE = gql`
  fragment DocColumnValuesForDocPage on Row {
    columnValues {
      displayValue
    }
  }
  query DocDataForDocPage(
    $databaseName: String!
    $refName: String!
    $docType: DocType
  ) {
    docOrDefaultDoc(
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
  query DocPageQueryNoBranch($databaseName: String!) {
    branchOrDefault(databaseName: $databaseName) {
      _id
      branchName
    }
  }
`;
