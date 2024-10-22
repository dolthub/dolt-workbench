import { MockedResponse } from "@apollo/client/testing";
import { DatabaseType, DoltDatabaseDetailsDocument } from "@gen/graphql-types";

export const databaseDetailsMock = (
  isDolt: boolean,
  hideDoltFeatures: boolean,
  isPostgres = false,
): MockedResponse => {
  return {
    request: { query: DoltDatabaseDetailsDocument },
    result: {
      data: {
        doltDatabaseDetails: {
          isDolt,
          hideDoltFeatures,
          type: isPostgres ? DatabaseType.Postgres : DatabaseType.Mysql,
        },
      },
    },
  };
};
