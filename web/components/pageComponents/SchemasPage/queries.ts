import { gql } from "@apollo/client";

export const DB_SCHEMAS = gql`
  query DatabaseSchemas {
    schemas
  }
`;
