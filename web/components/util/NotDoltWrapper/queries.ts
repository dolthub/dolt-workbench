import { gql } from "@apollo/client";

export const DATABASE_DETAILS = gql`
  query DoltDatabaseDetails {
    doltDatabaseDetails {
      isDolt
      hideDoltFeatures
      type
    }
  }
`;
