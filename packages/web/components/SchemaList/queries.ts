import { gql } from "@apollo/client";

export const ROWS_FOR_SCHEMAS = gql`
  query RowsForDoltSchemas($databaseName: String!, $refName: String!) {
    doltSchemas(databaseName: $databaseName, refName: $refName) {
      list {
        ...RowForSchemas
      }
    }
  }
`;

export const ROWS_FOR_PROCEDURES = gql`
  query RowsForDoltProcedures($databaseName: String!, $refName: String!) {
    doltProcedures(databaseName: $databaseName, refName: $refName) {
      list {
        ...RowForSchemas
      }
    }
  }
`;
