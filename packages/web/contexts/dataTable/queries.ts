import { gql } from "@apollo/client";

export const DATA_TABLE_QUERY = gql`
  fragment ColumnForDataTable on Column {
    name
    isPrimaryKey
    type
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
  query DataTableQuery($tableName: String!) {
    table(tableName: $tableName) {
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
  query RowsForDataTableQuery($tableName: String!, $offset: Int) {
    rows(tableName: $tableName, offset: $offset) {
      ...RowListRows
    }
  }
`;
