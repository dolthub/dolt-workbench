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
    tableName
    columns {
      ...ColumnForTableList
    }
  }
  query TableForBranch($tableName: String!) {
    table(tableName: $tableName) {
      ...TableWithColumns
    }
  }
`;
