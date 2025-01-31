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
  query DocsRowsForDocPageQuery(
    $connectionName: String!
    $databaseName: String!
    $refName: String!
  ) {
    docs(
      connectionName: $connectionName
      databaseName: $databaseName
      refName: $refName
    ) {
      ...DocListForDocPage
    }
  }
`;
