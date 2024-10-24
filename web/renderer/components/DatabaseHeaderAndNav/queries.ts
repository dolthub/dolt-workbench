import { gql } from "@apollo/client";

export const CURRENT_DATABASE = gql`
  query CurrentDatabase {
    currentDatabase
  }
`;

export const RESET_DATABASE = gql`
  mutation ResetDatabase($newDatabase: String) {
    resetDatabase(newDatabase: $newDatabase)
  }
`;
