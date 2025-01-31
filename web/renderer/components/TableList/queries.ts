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
    $connectionName: String!
    $databaseName: String!
    $refName: String!
    $tableName: String!
    $schemaName: String
  ) {
    table(
      connectionName: $connectionName
      databaseName: $databaseName
      refName: $refName
      tableName: $tableName
      schemaName: $schemaName
    ) {
      ...TableWithColumns
    }
  }
`;
