import { gql } from "@apollo/client";

export const ROWS_FOR_SCHEMAS = gql`
  fragment SchemaItem on SchemaItem {
    name
    type
  }
  query RowsForDoltSchemas(
    $databaseName: String!
    $refName: String!
    $schemaName: String
  ) {
    doltSchemas(
      databaseName: $databaseName
      refName: $refName
      schemaName: $schemaName
    ) {
      ...SchemaItem
    }
  }
`;

export const ROWS_FOR_PROCEDURES = gql`
  query RowsForDoltProcedures($databaseName: String!, $refName: String!) {
    doltProcedures(databaseName: $databaseName, refName: $refName) {
      ...SchemaItem
    }
  }
`;

export const SCHEMA_DEFINITION = gql`
  fragment RowForSchemaDefinition on Row {
    columnValues {
      displayValue
    }
    diff {
      diffColumnNames
      diffColumnValues {
        displayValue
      }
    }
  }
  fragment ColumnForSchemaDefinition on Column {
    name
    isPrimaryKey
    type
    sourceTable
    constraints {
      notNull
    }
  }
  query SchemaDefinition(
    $databaseName: String!
    $refName: String!
    $schemaName: String
    $name: String!
    $kind: SchemaType!
  ) {
    schemaDefinition(
      databaseName: $databaseName
      refName: $refName
      schemaName: $schemaName
      name: $name
      kind: $kind
    ) {
      queryString
      columns {
        ...ColumnForSchemaDefinition
      }
      rows {
        list {
          ...RowForSchemaDefinition
        }
      }
    }
  }
`;
