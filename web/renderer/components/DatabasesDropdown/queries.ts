import { gql } from "@apollo/client";

export const DATABASES = gql`
  query Databases($connectionName: String!) {
    databases(connectionName: $connectionName)
  }
`;
