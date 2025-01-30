import { gql } from "@apollo/client";

export const DATABASES = gql`
  query Databases($name: String!) {
    databases(name: $name)
  }
`;
