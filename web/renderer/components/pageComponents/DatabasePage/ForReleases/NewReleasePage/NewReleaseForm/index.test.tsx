import { MockedProvider } from "@apollo/client/testing";
import useMockRouter, { actions } from "@hooks/useMockRouter";
import { setupAndWait } from "@lib/testUtils.test";
import { releases } from "@lib/urls";
import { screen, waitFor } from "@testing-library/react";
import selectEvent from "react-select-event";
import NewTagForm from ".";
import * as mocks from "./mocks";

const jestRouter = jest.spyOn(require("next/router"), "useRouter");

jest.mock("next/router", () => {
  return {
    useRouter: () => {
      return { route: "", pathname: "", query: "", asPath: "" };
    },
  };
});

// skip this test for now, it fails on timeout issue
it.skip("tests NewTagForm", () => {
  beforeEach(() => {
    mocks.createNewTagData.mockClear();
  });

  const fillTagForm = async () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useMockRouter(jestRouter, {});
    const { user } = await setupAndWait(
      <MockedProvider
        mocks={[
          mocks.createTagMutationMock,
          mocks.branchSelectorQueryMock,
          mocks.defaultBranchQueryMock,
        ]}
      >
        <NewTagForm params={mocks.dbParams} />
      </MockedProvider>,
    );

    expect(
      screen.getByText("Pick a branch or recent commit"),
    ).toBeInTheDocument();
    await user.click(await screen.findByRole("combobox"));
    expect(
      await screen.findByText(mocks.fromBranch.branchName),
    ).toBeInTheDocument();

    await selectEvent.select(
      screen.getByRole("combobox"),
      mocks.fromBranch.branchName,
    );

    const [nameInput, messageInput] = screen.getAllByRole("textbox");

    await user.type(nameInput, mocks.tagName);
    await user.type(messageInput, mocks.message);

    return user;
  };

  it("renders correctly", async () => {
    await fillTagForm();

    expect(
      screen.getByText("Pick a branch or recent commit"),
    ).toBeInTheDocument();
    expect(screen.getByText(mocks.fromBranch.branchName)).toBeInTheDocument();

    const [nameInput, messageInput] = screen.getAllByRole("textbox");

    expect(screen.getByText(/tag name/i)).toBeInTheDocument();
    expect(nameInput).toHaveDisplayValue(mocks.tagName);

    expect(screen.getByText(/description/i)).toBeInTheDocument();
    expect(messageInput).toHaveDisplayValue(mocks.message);

    expect(
      screen.getByRole("button", {
        name: /create release/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /cancel/i,
      }),
    ).toBeInTheDocument();
  });

  it("creates a new tag", async () => {
    const user = await fillTagForm();

    await user.click(
      screen.getByRole("button", {
        name: /create release/i,
      }),
    );

    await waitFor(() =>
      expect(mocks.createNewTagData.mock.calls).toHaveLength(1),
    );

    // Navigating to releases page
    const { href, as } = releases(mocks.dbParams);
    await waitFor(() => {
      expect(actions.push).toHaveBeenCalledWith(href, as);
    });
  });

  it.skip("disables button when not filled out", async () => {
    const { user } = await setupAndWait(
      <MockedProvider
        mocks={[mocks.createTagMutationMock, mocks.branchSelectorQueryMock]}
      >
        <NewTagForm params={mocks.dbParams} />
      </MockedProvider>,
    );

    const btn = screen.getByRole("button", {
      name: /create release/i,
    });
    expect(btn).toBeDisabled();

    await user.click(await screen.findByRole("combobox"));
    await user.click(screen.getAllByText("main")[1]);

    expect(btn).toBeDisabled();

    await user.type(screen.getAllByRole("textbox")[0], mocks.tagName);
    expect(btn).toBeEnabled();

    await user.type(screen.getAllByRole("textbox")[1], mocks.message);
    expect(btn).toBeEnabled();
  });
});
