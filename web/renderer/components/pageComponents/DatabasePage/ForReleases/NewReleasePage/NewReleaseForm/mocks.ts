import { MockedResponse } from "@apollo/client/testing";
import {
  branchSelectorMock,
  mainBranch,
} from "@components/FormSelectForRefs/tests/mocks";
import { CreateTagDocument } from "@gen/graphql-types";
import { defaultBranchMock } from "../../../ForDefaultBranch/mocks";
import { generateFakeTag } from "../../ReleaseList/mocks";

export const dbParams = { databaseName: "test", connectionName: "connection" };
export const fromBranch = mainBranch(dbParams);
export const fromRefName: string = fromBranch.branchName;

export const tagParams = { ...dbParams, tagName: "v1" };
export const { tagName } = tagParams;
export const returnedTag = generateFakeTag(tagParams);
export const { message } = returnedTag;

// QUERY MOCKS

export const branchSelectorQueryMock = branchSelectorMock(dbParams);
export const defaultBranchQueryMock = defaultBranchMock(fromBranch);

// MUTATION MOCKS

export const createNewTagData = jest.fn(() => {
  return { data: { createTag: returnedTag } };
});

export const createTagMutationMock: MockedResponse = {
  request: {
    query: CreateTagDocument,
    variables: {
      ...dbParams,
      tagName,
      message,
      fromRefName,
      // author: {
      //   name: username,
      //   email,
      // },
    },
  },
  newData: createNewTagData,
};
