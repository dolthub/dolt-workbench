import { MockedResponse } from "@apollo/client/testing";
import {
  TableForSchemaListFragment,
  TableListForSchemasDocument,
} from "@gen/graphql-types";

export const schemaListMock = (
  tables: TableForSchemaListFragment[],
): MockedResponse => {
  return {
    request: {
      query: TableListForSchemasDocument,
    },
    result: { data: { tables } },
  };
};
