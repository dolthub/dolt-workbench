import { MockedProvider } from "@apollo/client/testing";
import { useDeleteBranchMutation } from "@gen/graphql-types";
import { setup } from "@lib/testUtils.test";
import { screen, waitFor } from "@testing-library/react";
import DeleteModal from ".";
import * as mocks from "./mocks";

describe("tests DeleteModal", () => {
  beforeEach(() => {
    mocks.deleteBranchNewData.mockClear();
  });

  // This test uses a real mutation that is mocked. It was too difficult to mock the mutation hook directly using jest.
  function renderModal() {
    const { user } = setup(
      <MockedProvider mocks={[mocks.deleteBranchMutationMock]}>
        <DeleteModal
          asset="object"
          isOpen
          setIsOpen={(_isOpen: boolean) => {}}
          mutationProps={{
            hook: useDeleteBranchMutation,
            variables: mocks.branchParams,
          }}
        >
          {mocks.deleteMessage}
        </DeleteModal>
      </MockedProvider>,
    );
    return { user };
  }

  it("renders correctly", async () => {
    renderModal();

    await screen.findByText("Delete object");
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(screen.getByText(mocks.deleteMessage)).toBeInTheDocument();
  });

  it("deletes when delete is pressed", async () => {
    const { user } = renderModal();

    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(mocks.deleteBranchNewData.mock.calls).toHaveLength(1);
    });
  });

  it("does not delete when cancel is pressed", async () => {
    const { user } = renderModal();

    await user.click(screen.getByText(/cancel/i));

    await waitFor(() => {
      expect(mocks.deleteBranchNewData.mock.calls).toHaveLength(0);
    });
  });
});
