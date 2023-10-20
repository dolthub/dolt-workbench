import { gql } from "@apollo/client";

export const GET_STATUS = gql`
  fragment Status on Status {
    _id
    refName
    tableName
    staged
    status
  }
  query GetStatus($databaseName: String!, $refName: String!) {
    status(databaseName: $databaseName, refName: $refName) {
      ...Status
    }
  }
`;
