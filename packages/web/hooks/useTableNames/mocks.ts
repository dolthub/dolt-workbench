import { MockedResponse } from "@apollo/client/testing";
import { TableNamesDocument } from "@gen/graphql-types";

export const tableNamesMock = (tables: string[]): MockedResponse => {
  return {
    request: {
      query: TableNamesDocument,
    },
    result: { data: { tableNames: { list: tables } } },
  };
};
