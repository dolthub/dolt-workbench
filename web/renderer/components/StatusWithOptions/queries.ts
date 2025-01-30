import { gql } from "@apollo/client";

export const GET_STATUS = gql`
  fragment Status on Status {
    _id
    refName
    tableName
    staged
    status
  }
  query GetStatus(    name:$String!
    $databaseName: String!, $refName: String!) {
    status(      name: $name
      databaseName: $databaseName, refName: $refName) {
      ...Status
    }
  }
`;

export const RESTORE_ALL = gql`
  mutation RestoreAll(    
    name:$String!
    $databaseName: String!, $refName: String!) {
    restoreAllTables(      
      name: $name,
      databaseName: $databaseName, refName: $refName)
  }
`;
