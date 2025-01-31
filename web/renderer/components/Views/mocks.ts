import { MockedResponse } from "@apollo/client/testing";
import {
  RowsForViewsDocument,
  SchemaItemFragment,
  SchemaType,
} from "@gen/graphql-types";
import chance from "@lib/chance";

const databaseParams = {
  databaseName: "dbname",
  connectionName: "connection",
};
const refName = "main";

export const params = {
  ...databaseParams,
  refName,
};

export const rowsForViewsFragmentMock: SchemaItemFragment[] = [
  ...Array(5).keys(),
].map(() => {
  return {
    __typename: "SchemaItem",
    type: SchemaType.View,
    name: chance.word(),
  };
});

export const rowsForViewsMock: MockedResponse = {
  request: {
    query: RowsForViewsDocument,
    variables: params,
  },
  result: {
    data: {
      views: rowsForViewsFragmentMock,
    },
  },
};

export const rowsForEmptyViewsMock: MockedResponse = {
  request: {
    query: RowsForViewsDocument,
    variables: params,
  },
  result: {
    data: {
      views: [],
    },
  },
};
