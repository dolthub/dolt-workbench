import { MockedResponse } from "@apollo/client/testing";
import {
  branchSelectorMock,
  mainBranch,
} from "@components/FormSelectForRefs/mocks";
import { CreateTagDocument } from "@gen/graphql-types";
import { loremer } from "@lib/loremer";
import { defaultBranchMock } from "../../../ForDefaultBranch/mocks";
import { generateFakeTag } from "../../ReleaseList/mocks";

export const dbParams = { databaseName: "test" };
export const fromBranch = mainBranch(dbParams);
export const fromRefName: string = fromBranch.branchName;

export const tagParams = { ...dbParams, tagName: "v1" };
export const message = loremer.sentence();
export const { tagName } = tagParams;
export const returnedTag = generateFakeTag(tagParams, message);

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
