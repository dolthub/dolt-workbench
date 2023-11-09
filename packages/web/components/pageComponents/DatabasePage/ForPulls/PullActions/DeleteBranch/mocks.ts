import { ApolloError } from "@apollo/client";
import { MockedResponse } from "@apollo/client/testing";
import {
  DeleteBranchDocument,
  GetBranchForPullDocument,
  PullDetailsForPullDetailsDocument,
  PullDetailsFragment,
  PullState,
} from "@gen/graphql-types";
import { BranchParams, PullParams } from "@lib/params";

export const pullParams: Required<PullParams> = {
  databaseName: "test",
  refName: "main",
  fromBranchName: "taylor/feature-branch",
};

export const pullWithDetails = (
  params: Required<PullParams>,
): PullDetailsFragment => {
  return {
    __typename: "PullWithDetails",
    state: PullState.Merged,
    _id: `databases/${params.databaseName}/pulls/${params.refName}/${params.fromBranchName}`,
    details: [],
  };
};

export const pullDetailsMock = (
  params: Required<PullParams>,
): MockedResponse => {
  return {
    request: {
      query: PullDetailsForPullDetailsDocument,
      variables: { ...params, toBranchName: params.refName },
    },
    result: { data: { pullWithDetails } },
  };
};

const branchParams: BranchParams = {
  branchName: pullParams.fromBranchName,
  databaseName: pullParams.databaseName,
};

export const branchExistsMock = (
  branchName = pullParams.fromBranchName,
): MockedResponse => {
  const params = { ...branchParams, branchName };
  return {
    request: {
      query: GetBranchForPullDocument,
      variables: params,
    },
    result: {
      data: {
        branch: {
          __typename: "Branch",
          _id: `databases/${params.databaseName}/branches/${params.branchName}`,
        },
      },
    },
  };
};

export const branchNotExistsMock: MockedResponse = {
  request: { query: GetBranchForPullDocument, variables: branchParams },
  result: {
    data: { branch: undefined },
  },
};

export const deleteBranchNewData = jest.fn(() => {
  return { data: { deleteBranch: true } };
});

export const deleteBranchMock = (
  branchName = pullParams.fromBranchName,
): MockedResponse => {
  return {
    request: {
      query: DeleteBranchDocument,
      variables: { ...branchParams, branchName },
    },
    newData: deleteBranchNewData,
  };
};

export const errorMessage = "error deleting branch";
export const deleteBranchErrorMock: MockedResponse = {
  request: { query: DeleteBranchDocument, variables: branchParams },
  error: new ApolloError({ errorMessage }),
};
