import { gql } from "@apollo/client";

export const CALL_PROCEDURE = gql`
  mutation CallProcedure(
    $databaseName: String!
    $refName: String!
    $name: String!
    $args: [String!]!
  ) {
    callProcedure(
      databaseName: $databaseName
      refName: $refName
      name: $name
      args: $args
    ) {
      rowsAffected
      queryString
      executionMessage
    }
  }
`;
