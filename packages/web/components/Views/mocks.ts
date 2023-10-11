import { MockedResponse } from "@apollo/client/testing";
import { RowForViewsFragment, RowsForViewsDocument } from "@gen/graphql-types";
import { chance } from "@hosted/fakers";

const databaseParams = {
  deploymentName: "test-dep",
  ownerName: "dolthub",
  databaseName: "dbname",
};
const refName = "main";

export const params = {
  ...databaseParams,
  refName,
};

export const rowsForViewsFragmentMock: RowForViewsFragment[] = [
  ...Array(5).keys(),
].map(() => {
  return {
    __typename: "Row",
    columnValues: [
      {
        __typename: "ColumnValue",
        displayValue: "view",
      },
      {
        __typename: "ColumnValue",
        displayValue: chance.word(),
      },
    ],
  };
});

export const rowsForViewsMock: MockedResponse = {
  request: {
    query: RowsForViewsDocument,
    variables: params,
  },
  result: {
    data: {
      views: {
        __typename: "RowList",
        list: rowsForViewsFragmentMock,
        nextPageToken: "",
      },
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
      views: {
        __typename: "RowList",
        list: null,
        nextPageToken: "",
      },
    },
  },
};
