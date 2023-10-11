import { MockedResponse } from "@apollo/client/testing";
import { TableNamesDocument } from "@gen/graphql-types";
import { RefParams } from "@lib/params";

export const tableNamesMock = (
  params: RefParams,
  tables: string[],
): MockedResponse => {
  return {
    request: {
      query: TableNamesDocument,
      variables: {
        databaseName: params.databaseName,
        refName: params.refName,
        filterSystemTables: true,
      },
    },
    result: { data: { tableNames: { list: tables } } },
  };
};
