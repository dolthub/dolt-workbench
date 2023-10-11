import { MockedProvider } from "@apollo/client/testing";
import useMockRouter, { actions } from "@hooks/useMockRouter";
import { setupAndWait } from "@lib/testUtils.test";
import { ref } from "@lib/urls";
import { screen, waitFor } from "@testing-library/react";
import selectEvent from "react-select-event";
import NewBranchForm from ".";
import * as mocks from "./mocks";

const jestRouter = jest.spyOn(require("next/router"), "useRouter");

jest.mock("next/router", () => {
  return {
    useRouter: () => {
      return { route: "", pathname: "", query: "", asPath: "" };
    },
  };
});

describe("tests NewBranchForm", () => {
  beforeEach(() => {
    mocks.createNewBranchData.mockClear();
  });

  const fillBranchForm = async () => {
    const { user } = await setupAndWait(
      <MockedProvider
        mocks={[
          mocks.createBranchMutationMock,
          mocks.branchSelectorQueryMock,
          mocks.defaultBranchQueryMock,
        ]}
      >
        <NewBranchForm params={mocks.dbParams} />
      </MockedProvider>,
    );

    await user.click(await screen.findByRole("combobox"));
    await selectEvent.select(
      screen.getByRole("combobox"),
      mocks.fromBranch.branchName,
    );

    await user.type(screen.getByRole("textbox"), mocks.newBranchName);
    return { user };
  };

  it("renders correctly", async () => {
    useMockRouter(jestRouter, {});
    await fillBranchForm();

    expect(
      screen.getByText("Pick a branch or recent commit"),
    ).toBeInTheDocument();
    expect(screen.getByText(mocks.fromBranch.branchName)).toBeInTheDocument();

    expect(screen.getByText("New branch name")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveDisplayValue(mocks.newBranchName);

    expect(
      screen.getByRole("button", {
        name: /create branch/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /cancel/i,
      }),
    ).toBeInTheDocument();
  });

  it("creates a new branch", async () => {
    useMockRouter(jestRouter, {});
    const { user } = await fillBranchForm();

    await user.click(
      screen.getByRole("button", {
        name: /create branch/i,
      }),
    );

    await waitFor(() =>
      expect(mocks.createNewBranchData.mock.calls).toHaveLength(1),
    );

    // Navigating to branch page
    const { href, as } = ref({
      ...mocks.dbParams,
      refName: mocks.newBranchName,
    });
    await waitFor(() => {
      expect(actions.push).toHaveBeenCalledWith(href, as);
    });
  });

  it.skip("disables button when not filled out", async () => {
    const { user } = await setupAndWait(
      <MockedProvider
        mocks={[mocks.createBranchMutationMock, mocks.branchSelectorQueryMock]}
      >
        <NewBranchForm params={mocks.dbParams} />
      </MockedProvider>,
    );

    const btn = screen.getByRole("button", {
      name: /create branch/i,
    });
    expect(btn).toBeDisabled();

    await user.click(await screen.findByRole("combobox"));
    await user.click(screen.getAllByText(mocks.fromBranch.branchName)[1]);

    expect(btn).toBeDisabled();

    await user.type(screen.getByRole("textbox"), mocks.newBranchName);
    expect(btn).toBeEnabled();
  });
});
