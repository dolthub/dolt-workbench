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
  query TableListForSchemas(
    $connectionName: String!
    $databaseName: String!
    $refName: String!
    $schemaName: String
  ) {
    tables(
      connectionName: $connectionName
      databaseName: $databaseName
      refName: $refName
      schemaName: $schemaName
      filterSystemTables: true
    ) {
      ...TableForSchemaList
    }
  }
`;
