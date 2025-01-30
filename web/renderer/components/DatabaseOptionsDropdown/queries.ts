import { gql } from "@apollo/client";

export const SELECT_FOR_CSV_DOWNLOAD = gql`
  query SqlSelectForCsvDownload(
    $name: String!
    $databaseName: String!
    $refName: String!
    $queryString: String!
  ) {
    sqlSelectForCsvDownload(
      name: $name
      databaseName: $databaseName
      refName: $refName
      queryString: $queryString
    )
  }
`;
