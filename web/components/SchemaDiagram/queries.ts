import { gql } from "@apollo/client";

export const TABLE_LIST_FOR_SCHEMAS_QUERY = gql`
  fragment ColumnsListForTableList on IndexColumn {
    name
    sqlType
  }
  fragment IndexForTableList on Index {
    name
    type
    comment
    columns {
      ...ColumnsListForTableList
    }
  }
  fragment TableForSchemaList on Table {
    _id
    tableName
    foreignKeys {
      ...ForeignKeysForDataTable
    }
    columns {
      ...ColumnForTableList
    }
    indexes {
      ...IndexForTableList
    }
  }
  query TableListForSchemas($databaseName: String!, $refName: String!) {
    tables(
      databaseName: $databaseName
      refName: $refName
      filterSystemTables: true
    ) {
      ...TableForSchemaList
    }
  }
`;
