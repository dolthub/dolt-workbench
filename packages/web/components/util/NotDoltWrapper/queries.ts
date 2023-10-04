import { gql } from "@apollo/client";

export const DOLT_DATABASE_DETAILS = gql`
  query DoltDatabaseDetails {
    doltDatabaseDetails {
      isDolt
      hideDoltFeatures
    }
  }
`;
