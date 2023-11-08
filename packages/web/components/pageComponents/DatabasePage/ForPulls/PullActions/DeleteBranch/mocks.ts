import { ApolloError } from "@apollo/client";
import { MockedResponse } from "@apollo/client/testing";
import {
  DeleteBranchDocument,
  GetBranchForPullDocument,
  PullForPullDetailsFragment,
  PullState,
} from "@gen/graphql-types";
import { fakeDeploymentParams, fakeTimestamp } from "@hosted/fakers";
import { BranchUtils, PullUtils } from "@hosted/resource-utils";
import { BranchParams, PullParams } from "@lib/params";

export const pullParams: PullParams = {
  ...fakeDeploymentParams(),
  databaseName: "test",
  pullId: "5",
};

const pullId = PullUtils.rn.fromParams(pullParams);

export const pull: PullForPullDetailsFragment = {
  ...pullParams,
  __typename: "Pull",
  _id: pullId,
  title: "Pull Title",
  description: "",
  state: PullState.Merged,
  creatorName: "taylor",
  fromBranchName: "taylor/feature-branch",
  toBranchName: "master",
  createdAt: fakeTimestamp(),
};

const branchParams: BranchParams = {
  ownerName: pull.ownerName,
  deploymentName: pull.deploymentName,
  branchName: pull.fromBranchName,
  databaseName: pull.databaseName,
};

export const branchExistsMock = (
  branchName = pull.fromBranchName,
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
          _id: BranchUtils.rn.fromParams(params),
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
  branchName = pull.fromBranchName,
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
