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
): TagForListFragment {
  const message = chance.sentence();
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
  databaseName: "dbname",
  connectionName: "connection",
};

// export const writePermRepoRoleMock = repoRoleMock(databaseParams, RepoRole.Writer);
// export const noPermRepoRoleMock = repoRoleMock(
//   databaseParams,
//   RepoRole.Unspecified,
// );

const getRequest = (params: DatabaseParams) => {
  return {
    query: TagListDocument,
    variables: params,
  };
};

export const tag1 = generateFakeTag({ ...databaseParams, tagName: "v1" });
export const tag2 = generateFakeTag({ ...databaseParams, tagName: "v2" });

export const getTagsListQueryMock = (
  params: DatabaseParams,
  list: TagForListFragment[],
): MockedResponse => {
  return {
    request: getRequest(params),
    result: {
      data: buildFakeData(list),
    },
  };
};

export const tagsListQueryMock: MockedResponse = getTagsListQueryMock(
  databaseParams,
  [tag1, tag2],
);

export const tagError = "Tag Error";

export const tagsListErrorMock = (params: DatabaseParams): MockedResponse => {
  return {
    request: getRequest(params),
    error: new Error(tagError),
  };
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
