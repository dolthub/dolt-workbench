import { gql } from "@apollo/client";

export const SELECT_FOR_CSV_DOWNLOAD = gql`
  query SqlSelectForCsvDownload(
    $databaseName: String!
    $refName: String!
    $queryString: String!
  ) {
    sqlSelectForCsvDownload(
      databaseName: $databaseName
      refName: $refName
      queryString: $queryString
    )
  }
`;
