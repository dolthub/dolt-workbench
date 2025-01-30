import { gql } from "@apollo/client";

export const DATABASE_DETAILS = gql`
  query DoltDatabaseDetails($name: String!) {
    doltDatabaseDetails(name: $name) {
      isDolt
      hideDoltFeatures
      type
    }
  }
`;
