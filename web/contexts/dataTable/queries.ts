import { gql } from "@apollo/client";

export const DATA_TABLE_QUERY = gql`
  fragment ColumnForDataTable on Column {
    name
    isPrimaryKey
    type
    sourceTable
    constraints {
      notNull
    }
  }
  fragment ForeignKeyColumnForDataTable on ForeignKeyColumn {
    referencedColumnName
    referrerColumnIndex
  }
  fragment ForeignKeysForDataTable on ForeignKey {
    tableName
    columnName
    referencedTableName
    foreignKeyColumn {
      ...ForeignKeyColumnForDataTable
    }
  }
  query DataTableQuery(
    $databaseName: String!
    $refName: String!
    $tableName: String!
  ) {
    table(
      databaseName: $databaseName
      refName: $refName
      tableName: $tableName
    ) {
      _id
      columns {
        ...ColumnForDataTable
      }
      foreignKeys {
        ...ForeignKeysForDataTable
      }
    }
  }
`;

export const ROWS_FOR_DATA_TABLE = gql`
  fragment RowForDataTable on Row {
    columnValues {
      displayValue
    }
  }
  fragment RowListRows on RowList {
    nextOffset
    list {
      ...RowForDataTable
    }
  }
  query RowsForDataTableQuery(
    $databaseName: String!
    $refName: String!
    $tableName: String!
    $offset: Int
  ) {
    rows(
      databaseName: $databaseName
      refName: $refName
      tableName: $tableName
      offset: $offset
    ) {
      ...RowListRows
    }
  }
`;
