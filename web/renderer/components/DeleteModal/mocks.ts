import { MockedResponse } from "@apollo/client/testing";
import { DeleteBranchDocument } from "@gen/graphql-types";
import chance from "@lib/chance";
import { BranchParams, DatabaseParams } from "@lib/params";

export const dbParams: DatabaseParams = {
  databaseName: "test",
  connectionName: "connection",
};
export const branchParams: BranchParams = { ...dbParams, branchName: "v1" };

export const deleteMessage = chance.sentence();

// MUTATION MOCKS

export const deleteBranchNewData = jest.fn(() => {
  return { data: { deleteBranch: true } };
});
export const deleteBranchMutationMock: MockedResponse = {
  request: {
    query: DeleteBranchDocument,
    variables: branchParams,
  },
  newData: deleteBranchNewData,
};
