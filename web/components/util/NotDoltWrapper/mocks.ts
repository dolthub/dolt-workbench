import { MockedResponse } from "@apollo/client/testing";
import { DoltDatabaseDetailsDocument } from "@gen/graphql-types";

export const databaseDetailsMock = (
  isDolt: boolean,
  hideDoltFeatures: boolean,
): MockedResponse => {
  return {
    request: { query: DoltDatabaseDetailsDocument },
    result: {
      data: { doltDatabaseDetails: { isDolt, hideDoltFeatures } },
    },
  };
};
