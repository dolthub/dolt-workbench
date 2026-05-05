import { gql } from "@apollo/client";

export const DELETE_ROW = gql`
  mutation DeleteRow(
    $databaseName: String!
    $refName: String!
    $schemaName: String
    $tableName: String!
    $where: [WhereClause!]!
  ) {
    deleteRow(
      databaseName: $databaseName
      refName: $refName
      schemaName: $schemaName
      tableName: $tableName
      where: $where
    ) {
      rowsAffected
      queryString
    }
  }
`;
