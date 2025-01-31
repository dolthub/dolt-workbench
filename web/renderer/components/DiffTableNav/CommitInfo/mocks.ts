import { MockedResponse } from "@apollo/client/testing";
import {
  CommitForAfterCommitHistoryFragment,
  HistoryForCommitDocument,
} from "@gen/graphql-types";
import { fakeCommitId } from "@hooks/useCommitListForBranch/mocks";
import chance from "@lib/chance";
import { RefParams } from "@lib/params";

export const params: RefParams = {
  refName: "main",
  databaseName: "dbname",
  connectionName: "connection",
};
const date = Date.now();

const commitFrag = (
  commitId: string,
  commit?: Partial<CommitForAfterCommitHistoryFragment>,
): CommitForAfterCommitHistoryFragment => {
  const username = chance.word();
  return {
    __typename: "Commit",
    _id: `database/${params.databaseName}/commits/${commitId}`,
    commitId,
    message: chance.sentence(),
    committedAt: date,
    parents: [fakeCommitId()],
    committer: {
      __typename: "DoltWriter",
      _id: `${username}@gmail.com`,
      displayName: chance.name(),
      username,
    },
    ...commit,
  };
};

const commitTwoParents = fakeCommitId();
export const commitOneParent = fakeCommitId();
const commitTwoSameParents = fakeCommitId();
const parent = fakeCommitId();
export const fromCommitId = fakeCommitId();

export const commitOpts: Record<string, CommitForAfterCommitHistoryFragment> = {
  [commitTwoParents]: commitFrag(commitTwoParents, {
    parents: [fakeCommitId(), fakeCommitId()],
  }),
  [commitOneParent]: commitFrag(commitOneParent),
  [commitTwoSameParents]: commitFrag(commitTwoSameParents, {
    parents: [parent, parent],
  }),
};

export const tests = [
  {
    desc: "commit with two parents",
    commitId: commitTwoParents,
    expectedParents: 2,
  },
  {
    desc: "commit with one parent",
    commitId: commitOneParent,
    expectedParents: 1,
  },
];

export const commitsQuery = (afterCommitId: string): MockedResponse => {
  return {
    request: {
      query: HistoryForCommitDocument,
      variables: {
        databaseName: params.databaseName,
        afterCommitId,
      },
    },
    result: {
      data: {
        commits: {
          __typename: "CommitList",
          list: [commitOpts[afterCommitId]],
        },
      },
    },
  };
};
