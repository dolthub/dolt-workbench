import { MockedResponse } from "@apollo/client/testing";
import {
  DoltWriterForHistoryFragment,
  TagForListFragment,
  TagListDocument,
  TagListQuery,
} from "@gen/graphql-types";
import chance from "@lib/chance";
import { DatabaseParams } from "@lib/params";

export function generateFakeTag(
  params: DatabaseParams & { tagName: string },
  message: string,
): TagForListFragment {
  const email = chance.email();
  const doltWriter: DoltWriterForHistoryFragment = {
    __typename: "DoltWriter",
    _id: email,
    displayName: chance.name(),
    username: chance.word(),
    emailAddress: email,
  };

  return {
    __typename: "Tag",
    _id: `databases/${params.databaseName}/tags/${params.tagName}`,
    ...params,
    message,
    taggedAt: new Date(),
    tagger: doltWriter,
    commitId: chance.hash(),
  };
}

export function buildFakeData(list: TagForListFragment[]): TagListQuery {
  return {
    __typename: "Query",
    tags: {
      __typename: "TagList",
      list,
    },
  };
}

// QUERY MOCKS

export const databaseParams = {
  deploymentName: "test",
  ownerName: "dolthub",
  databaseName: "dbname",
};

// export const writePermRepoRoleMock = repoRoleMock(databaseParams, RepoRole.Writer);
// export const noPermRepoRoleMock = repoRoleMock(
//   databaseParams,
//   RepoRole.Unspecified,
// );

const request = {
  query: TagListDocument,
  variables: databaseParams,
};

export const tag1 = generateFakeTag(
  { ...databaseParams, tagName: "v1" },
  chance.sentence(),
);
export const tag2 = generateFakeTag(
  { ...databaseParams, tagName: "v2" },
  chance.sentence(),
);

export const tagsListQueryMock: MockedResponse = {
  request,
  result: {
    data: buildFakeData([tag1, tag2]),
  },
};

// // MUTATION MOCKS

// export const deleteTagNewData = jest.fn(() => {
//   return { data: { deleteBranch: true } };
// });
// export function buildDeleteTagMutationMock(tagName: string): MockedResponse {
//   return {
//     request: {
//       query: DeleteTagDocument,
//       variables: { ...databaseParams, tagName },
//     },
//     newData: deleteTagNewData,
//   };
// }
