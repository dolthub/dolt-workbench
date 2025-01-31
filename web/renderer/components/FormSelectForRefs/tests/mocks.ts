import { MockedResponse } from "@apollo/client/testing";
import {
  generateFakeTag,
  getTagsListQueryMock,
  tagsListErrorMock,
} from "@components/pageComponents/DatabasePage/ForReleases/ReleaseList/mocks";
import {
  BranchForBranchSelectorFragment,
  BranchesForSelectorDocument,
  TableNamesForBranchDocument,
} from "@gen/graphql-types";
import {
  commitMock,
  commitsListMock,
  mockCommitError,
} from "@hooks/useCommitListForBranch/mocks";
import chance from "@lib/chance";
import { DatabaseParams, RefParams, TableParams } from "@lib/params";
import { defaultBranchMock } from "@pageComponents/DatabasePage/ForDefaultBranch/mocks";

export const fakeParams = {
  databaseName: "dbname",
  connectionName: "connection",
};
export const fakeBranchName = { name: "test-branch" };
export const defaultBranchQuery = defaultBranchMock({
  ...fakeParams,
  branchName: fakeBranchName.name,
});
export const fakeRefParams = { ...fakeParams, refName: fakeBranchName.name };
export const randomSelect = chance.name();

const testBranch = (
  params: DatabaseParams,
): BranchForBranchSelectorFragment => {
  return {
    __typename: "Branch",
    ...params,
    branchName: "test",
  };
};

export const mainBranch = (
  params: DatabaseParams,
): BranchForBranchSelectorFragment => {
  return {
    __typename: "Branch",
    ...params,
    branchName: "main",
  };
};

export const branchSelectorMock = (
  params: DatabaseParams,
  empty = false,
): MockedResponse => {
  return {
    request: {
      query: BranchesForSelectorDocument,
      variables: params,
    },
    result: {
      data: {
        allBranches: empty ? [] : [testBranch(params), mainBranch(params)],
      },
    },
  };
};

export const branchError = "branch error";

export const mockBranchError = (params: DatabaseParams): MockedResponse => {
  return {
    request: {
      query: BranchesForSelectorDocument,
      variables: params,
    },
    error: new Error(branchError),
  };
};

const commit1 = commitMock(fakeParams);
const commit2 = commitMock(fakeParams);

export const getBranchAndCommitMocks = (
  params: RefParams,
  error = false,
  empty = false,
): MockedResponse[] => {
  if (error) {
    return [mockBranchError(params), ...mockCommitError(params)];
  }
  if (empty) {
    return [branchSelectorMock(params, true), ...commitsListMock(params, [])];
  }
  return [
    branchSelectorMock(params),
    ...commitsListMock(params, [commit1, commit2]),
  ];
};

const tag1 = generateFakeTag({ ...fakeParams, tagName: "v1" });
const tag2 = generateFakeTag({ ...fakeParams, tagName: "v2" });

export const getBranchAndTagMocks = (
  params: RefParams,
  error = false,
  empty = false,
): MockedResponse[] => {
  if (error) {
    return [mockBranchError(params), tagsListErrorMock(params)];
  }
  if (empty) {
    return [branchSelectorMock(params, true), getTagsListQueryMock(params, [])];
  }
  return [
    branchSelectorMock(params),
    getTagsListQueryMock(params, [tag1, tag2]),
  ];
};

export const tableListEmptyMock = (params: RefParams): MockedResponse => {
  return {
    request: {
      query: TableNamesForBranchDocument,
      variables: params,
    },
    result: {
      data: {
        tableNames: { list: [] },
      },
    },
  };
};

export const tableListMock = (params: TableParams): MockedResponse => {
  return {
    request: {
      query: TableNamesForBranchDocument,
      variables: params,
    },
    result: {
      data: {
        tableNames: { list: [params.tableName] },
      },
    },
  };
};

export type Test = {
  desc: string;
  value: string | undefined;
  error: boolean;
  empty: boolean;
  valueToSelect?: string;
};

const commonTests: Test[] = [
  {
    desc: "no options",
    value: undefined,
    error: false,
    empty: true,
  },
  {
    desc: "errors",
    value: undefined,
    error: true,
    empty: true,
  },
  {
    desc: "no selected value with options",
    value: undefined,
    empty: false,
    error: false,
  },
  {
    desc: "selected branchName value",
    value: "test",
    empty: false,
    error: false,
    valueToSelect: "main",
  },
];

export const branchAndCommitTests: Test[] = [
  ...commonTests,
  {
    desc: "selected commitId value",
    value: commit1.commitId,
    empty: false,
    error: false,
    valueToSelect: commit2.commitId,
  },
];

export const branchAndTagTests: Test[] = [
  ...commonTests,
  {
    desc: "selected tagName value",
    value: tag1.tagName,
    empty: false,
    error: false,
    valueToSelect: tag2.tagName,
  },
];
