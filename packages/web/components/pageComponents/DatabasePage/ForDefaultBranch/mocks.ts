import { MockedResponse } from "@apollo/client/testing";
import { DefaultBranchPageQueryDocument } from "@gen/graphql-types";
import { BranchParams } from "@lib/params";

export const defaultBranchMock = (params: BranchParams): MockedResponse => {
  return {
    request: {
      query: DefaultBranchPageQueryDocument,
      variables: {
        databaseName: params.databaseName,
        filterSystemTables: true,
      },
    },
    result: {
      data: {
        defaultBranch: {
          __typename: "Branch",
          _id: `databases/${params.databaseName}/branches/${params.branchName}`,
          branchName: params.branchName,
          tableNames: { list: ["tablename"] },
        },
      },
    },
  };
};
