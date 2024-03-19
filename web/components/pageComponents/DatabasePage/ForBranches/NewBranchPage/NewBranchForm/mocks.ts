import { MockedResponse } from "@apollo/client/testing";
import {
  branchSelectorMock,
  mainBranch,
} from "@components/FormSelectForRefs/tests/mocks";
import { CreateBranchDocument } from "@gen/graphql-types";
import { loremer } from "@lib/loremer";
import { DatabaseParams } from "@lib/params";
import { defaultBranchMock } from "../../../ForDefaultBranch/mocks";

export const dbParams: DatabaseParams = {
  databaseName: "test",
};
export const fromBranch = mainBranch(dbParams);
export const fromRefName: string = fromBranch.branchName;

// Using generateFakeBranch since we want the same ownerName and repoName as the branchNames mock
export const newBranchName = loremer.resourceNameSegment();

// QUERY MOCKS

export const branchSelectorQueryMock = branchSelectorMock(dbParams);
export const defaultBranchQueryMock = defaultBranchMock(fromBranch);

// MUTATION MOCKS

export const createNewBranchData = jest.fn(() => {
  return { data: { createBranch: newBranchName } };
});

export const createBranchMutationMock: MockedResponse = {
  request: {
    query: CreateBranchDocument,
    variables: {
      ...dbParams,
      newBranchName,
      fromRefName,
    },
  },
  newData: createNewBranchData,
};
