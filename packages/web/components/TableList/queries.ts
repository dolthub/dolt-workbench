import { gql } from "@apollo/client";

export const GET_TABLE = gql`
  fragment ColumnForTableList on Column {
    name
    type
    isPrimaryKey
    constraints {
      notNull
    }
  }
  fragment TableWithColumns on Table {
    _id
    tableName
    columns {
      ...ColumnForTableList
    }
  }
  query TableForBranch(
    $databaseName: String!
    $refName: String!
    $tableName: String!
  ) {
    table(
      databaseName: $databaseName
      refName: $refName
      tableName: $tableName
    ) {
      ...TableWithColumns
    }
  }
`;
