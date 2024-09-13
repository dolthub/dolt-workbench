import { ApolloError } from "@apollo/client";
import { MockedResponse } from "@apollo/client/testing";
import { defaultBranchMock } from "@components/pageComponents/DatabasePage/ForDefaultBranch/mocks";
import { GetBranchDocument, GetTagDocument } from "@gen/graphql-types";
import { DatabaseParams, RefParams } from "@lib/params";

const dbParams: DatabaseParams = { databaseName: "test" };
export const refParams: RefParams = { ...dbParams, refName: "main" };

export const mocks: MockedResponse[] = [
  // Queries
  {
    request: {
      query: GetBranchDocument,
      variables: { ...dbParams, branchName: refParams.refName },
    },
    result: {
      data: {
        branch: {
          __typename: "Branch",
          _id: `database/${refParams.databaseName}/branches/${refParams.refName}`,
        },
      },
    },
  },

  {
    request: {
      query: GetTagDocument,
      variables: { ...dbParams, tagName: refParams.refName },
    },
    error: new ApolloError({ errorMessage: "failed to find tag" }),
  },
  defaultBranchMock({
    databaseName: refParams.databaseName,
    branchName: refParams.refName,
  }),
];
