import { MockedResponse } from "@apollo/client/testing";
import {
  DeleteDocDocument,
  DocForDocPageFragment,
  DocRowForDocPageFragment,
  DocsRowsForDocPageQueryDocument,
  DocType,
  SaveDocDocument,
} from "@gen/graphql-types";
import { RefParams } from "@lib/params";

export const markdown = "# Header\nLine of markdown";
const getDocRow = (doc: DocType): DocRowForDocPageFragment => {
  return {
    __typename: "Row",
    columnValues: [
      { __typename: "ColumnValue", displayValue: `${doc.toUpperCase()}.md` },
      { __typename: "ColumnValue", displayValue: markdown },
    ],
  };
};

export const getDoc = (doc: DocType): DocForDocPageFragment => {
  return {
    __typename: "Doc",
    docRow: getDocRow(doc),
  };
};

export const docsMock = (
  params: RefParams,
  docs: DocType[],
): MockedResponse => {
  return {
    request: { query: DocsRowsForDocPageQueryDocument, variables: params },
    result: {
      data: { docs: { __typename: "DocList", list: docs.map(getDoc) } },
    },
  };
};

const mutationResult = {
  __typename: "MutationResult",
  rowsAffected: 1,
  queryString: "",
  executionMessage: "Query OK, 1 row affected.",
};

export const saveDocMock = (
  params: RefParams,
  docType: DocType,
  md: string,
): MockedResponse => {
  return {
    request: {
      query: SaveDocDocument,
      variables: { ...params, docType, markdown: md },
    },
    result: { data: { saveDoc: mutationResult } },
  };
};

export const deleteDocMock = (
  params: RefParams,
  docType: DocType,
): MockedResponse => {
  return {
    request: { query: DeleteDocDocument, variables: { ...params, docType } },
    result: { data: { deleteDoc: mutationResult } },
  };
};
