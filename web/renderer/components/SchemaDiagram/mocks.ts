import { MockedResponse } from "@apollo/client/testing";
import {
  TableForSchemaListFragment,
  TableListForSchemasDocument,
} from "@gen/graphql-types";
import { RefParams } from "@lib/params";

export const schemaListMock = (
  params: RefParams,
  tables: TableForSchemaListFragment[],
): MockedResponse => {
  return {
    request: {
      query: TableListForSchemasDocument,
      variables: params,
    },
    result: { data: { tables } },
  };
};
