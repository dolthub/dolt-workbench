import { gql } from "@apollo/client";

export const DATABASE_DETAILS = gql`
  query DoltDatabaseDetails($connectionName: String!) {
    doltDatabaseDetails(connectionName: $connectionName) {
      isDolt
      hideDoltFeatures
      type
    }
  }
`;
