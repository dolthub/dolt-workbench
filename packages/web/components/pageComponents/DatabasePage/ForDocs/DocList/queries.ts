import { gql } from "@apollo/client";

export const DOC_ROWS_FOR_DOC_PAGE = gql`
  fragment DocRowForDocPage on Row {
    columnValues {
      displayValue
    }
  }
  fragment DocForDocPage on Doc {
    docRow {
      ...DocRowForDocPage
    }
  }
  fragment DocListForDocPage on DocList {
    list {
      ...DocForDocPage
    }
  }
  query DocsRowsForDocPageQuery($databaseName: String!, $refName: String!) {
    docs(databaseName: $databaseName, refName: $refName) {
      ...DocListForDocPage
    }
  }
`;
