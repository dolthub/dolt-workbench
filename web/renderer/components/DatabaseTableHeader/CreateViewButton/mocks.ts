import { MockedResponse } from "@apollo/client/testing";
import { CreateViewDocument } from "@gen/graphql-types";

export const setEditorString = jest.fn();
export const setExecutedQuery = jest.fn();
export const setExecutionMessage = jest.fn();
export const setExecutionError = jest.fn();
export const setError = jest.fn();

export const SqlEditorContextProviderValueMock = {
  setEditorString,
  setExecutedQuery,
  editorString: "",
  toggleSqlEditor: jest.fn(),
  showSqlEditor: false,
  executeQuery: jest.fn(),
  queryClickHandler: jest.fn(),
  setError,
  setExecutionMessage,
  setExecutionError,
  loading: false,
  modalState: {
    forkIsOpen: false,
    errorIsOpen: false,
  },
  setModalState: jest.fn(),
  executeSaveQuery: jest.fn(),
};

export const createViewMock = (
  databaseName: string,
  refName: string,
  name: string,
  queryString: string,
): MockedResponse => {
  return {
    request: {
      query: CreateViewDocument,
      variables: { databaseName, refName, name, queryString },
    },
    result: {
      data: {
        createView: {
          __typename: "MutationResult",
          rowsAffected: 0,
          queryString: `CREATE VIEW \`${name}\` AS ${queryString}`,
          executionMessage: "Query OK.",
        },
      },
    },
  };
};
