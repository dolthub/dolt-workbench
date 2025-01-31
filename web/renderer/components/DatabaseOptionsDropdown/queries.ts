import { gql } from "@apollo/client";

export const SELECT_FOR_CSV_DOWNLOAD = gql`
  query SqlSelectForCsvDownload(
    $connectionName: String!
    $databaseName: String!
    $refName: String!
    $queryString: String!
  ) {
    sqlSelectForCsvDownload(
      connectionName: $connectionName
      databaseName: $databaseName
      refName: $refName
      queryString: $queryString
    )
  }
`;
