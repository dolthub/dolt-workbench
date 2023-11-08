import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { DeploymentRole } from "@gen/graphql-types";
import { mocksForDepRoleHook } from "@hooks/useDeploymentRole/mocks";
import { fakeDeploymentParams } from "@hosted/fakers";
import { DatabaseParams } from "@lib/params";
import { providerNoCacheOptions } from "@lib/queryUtils";
import { setup } from "@lib/testUtils.test";
import { screen, waitFor } from "@testing-library/react";
import DeleteBranch from ".";
import { pullDetailsMock } from "../../mocks";
import * as mocks from "./mocks";

const params: DatabaseParams = {
  ...fakeDeploymentParams(),
  databaseName: "test",
};

async function renderWithProvider(
  mockRes: MockedResponse[],
  showButton: boolean,
  fromBranchName = mocks.pull.fromBranchName,
) {
  const { user } = setup(
    <MockedProvider mocks={mockRes} defaultOptions={providerNoCacheOptions}>
      <DeleteBranch pull={{ ...mocks.pull, fromBranchName }} />
    </MockedProvider>,
  );

  if (showButton) {
    expect(await screen.findByText(fromBranchName)).toBeVisible();
  } else {
    expect(screen.queryByText("Delete Branch")).not.toBeInTheDocument();
    expect(screen.queryByText(fromBranchName)).not.toBeInTheDocument();
  }

  return user;
}

describe("test DeleteBranch", () => {
  it("renders nothing for no write perms", async () => {
    await renderWithProvider(
      [
        mocks.branchExistsMock(),
        ...mocksForDepRoleHook(params, DeploymentRole.Reader),
      ],
      false,
    );
  });

  it("renders nothing for master from branch", async () => {
    await renderWithProvider(
      [
        mocks.branchExistsMock("master"),
        ...mocksForDepRoleHook(params, DeploymentRole.Admin),
      ],
      false,
      "master",
    );
  });

  it("renders delete branch button and errors on delete", async () => {
    const user = await renderWithProvider(
      [
        mocks.branchExistsMock(),
        mocks.deleteBranchErrorMock,
        ...mocksForDepRoleHook(mocks.pullParams, DeploymentRole.Admin),
      ],
      true,
    );

    expect(mocks.deleteBranchNewData).not.toHaveBeenCalled();
    await user.click(screen.getByText("Delete Branch"));
    expect(await screen.findByText(mocks.errorMessage)).toBeVisible();
    expect(mocks.deleteBranchNewData).not.toHaveBeenCalled();
  });

  it("renders delete branch button for branch that exists", async () => {
    const user = await renderWithProvider(
      [
        mocks.branchExistsMock(),
        mocks.deleteBranchMock(),
        mocks.branchNotExistsMock,
        pullDetailsMock(mocks.pullParams),
        ...mocksForDepRoleHook(mocks.pullParams, DeploymentRole.Admin),
      ],
      true,
    );

    expect(mocks.deleteBranchNewData).not.toHaveBeenCalled();
    await user.click(screen.getByText("Delete Branch"));
    await waitFor(() => expect(mocks.deleteBranchNewData).toHaveBeenCalled());
  });
});
