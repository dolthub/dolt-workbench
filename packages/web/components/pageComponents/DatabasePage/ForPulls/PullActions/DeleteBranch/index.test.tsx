import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { setup } from "@lib/testUtils.test";
import { screen, waitFor } from "@testing-library/react";
import DeleteBranch from ".";
import * as mocks from "./mocks";

async function renderWithProvider(
  mockRes: MockedResponse[],
  showButton: boolean,
  fromBranchName = mocks.pullParams.fromBranchName,
) {
  const { user } = setup(
    <MockedProvider mocks={mockRes}>
      <DeleteBranch
        pullDetails={mocks.pullWithDetails(mocks.pullParams)}
        params={mocks.pullParams}
      />
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
  it("renders nothing for main from branch", async () => {
    await renderWithProvider([mocks.branchExistsMock("main")], false, "main");
  });

  it("renders delete branch button and errors on delete", async () => {
    const user = await renderWithProvider(
      [mocks.branchExistsMock(), mocks.deleteBranchErrorMock],
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
        mocks.pullDetailsMock(mocks.pullParams),
      ],
      true,
    );

    expect(mocks.deleteBranchNewData).not.toHaveBeenCalled();
    await user.click(screen.getByText("Delete Branch"));
    await waitFor(() => expect(mocks.deleteBranchNewData).toHaveBeenCalled());
  });
});
