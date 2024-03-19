import { MockedResponse } from "@apollo/client/testing";
import {
  CommitForHistoryFragment,
  HistoryForBranchDocument,
} from "@gen/graphql-types";
import chance from "@lib/chance";
import { DatabaseParams, RefParams } from "@lib/params";

const date = new Date();

export function fakeCommitId() {
  return chance.hash().slice(0, 32);
}

export const commitMock = (
  params: DatabaseParams,
): CommitForHistoryFragment => {
  const commitId = fakeCommitId();
  return {
    __typename: "Commit",
    _id: `databases/${params.databaseName}/commits/${commitId}`,
    commitId,
    message: chance.sentence(),
    committedAt: date.valueOf(),
    committer: {
      __typename: "DoltWriter",
      _id: chance.email(),
      displayName: chance.name(),
      username: chance.word(),
      emailAddress: chance.email(),
    },
    parents: [],
  };
};

export const commitsListMock = (
  params: RefParams,
  commits: CommitForHistoryFragment[],
): MockedResponse[] => [
  {
    request: {
      query: HistoryForBranchDocument,
      variables: params,
    },
    result: {
      data: {
        __typename: "Query",
        commits: {
          __typename: "CommitList",
          nextPageToken: "",
          list: commits,
        },
      },
    },
  },
];

export const commitError = "Commit Error";

export const mockCommitError = (params: RefParams): MockedResponse[] => [
  {
    request: {
      query: HistoryForBranchDocument,
      variables: params,
    },
    error: new Error(commitError),
  },
];
