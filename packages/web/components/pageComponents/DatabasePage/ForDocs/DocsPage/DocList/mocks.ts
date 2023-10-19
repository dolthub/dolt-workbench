import { MockedResponse } from "@apollo/client/testing";
import {
  DocForDocPageFragment,
  DocRowForDocPageFragment,
  DocsRowsForDocPageQueryDocument,
  DocType,
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
