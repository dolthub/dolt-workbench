import { MockedProvider } from "@apollo/client/testing";
import { screen } from "@testing-library/react";
import { TagForListFragment } from "@gen/graphql-types";
import { renderAndWait } from "@lib/testUtils.test";
import ReleaseList from ".";
import * as mocks from "./mocks";
import { formatLongDate } from "./ReleaseHeader";

async function expectTagInfo(t: TagForListFragment) {
  expect(await screen.findByText(t.tagName)).toBeInTheDocument();
  expect(screen.getByText(t.message)).toBeInTheDocument();
  expect(
    screen.getByText(formatLongDate(new Date(t.taggedAt))),
  ).toBeInTheDocument();
  if (t.tagger.username) {
    expect(await screen.findByText(t.tagger.username)).toBeInTheDocument();
  }
  expect(
    screen.getByRole("link", {
      name: t.commitId,
    }),
  ).toBeInTheDocument();
}

describe("tests ReleaseList", () => {
  // beforeEach(() => {
  //   mocks.deleteTagNewData.mockClear();
  // });

  it("renders correctly", async () => {
    await renderAndWait(
      <MockedProvider mocks={[mocks.tagsListQueryMock]}>
        <ReleaseList params={mocks.databaseParams} />
      </MockedProvider>,
    );

    expect(
      screen.getByRole("heading", {
        name: /releases/i,
      }),
    ).toBeInTheDocument();

    // expect(
    //   await screen.findByRole("button", {
    //     name: /create release/i,
    //   }),
    // ).toBeInTheDocument();

    await expectTagInfo(mocks.tag1);
    await expectTagInfo(mocks.tag2);
    expect(screen.getByText(/latest release/i)).toBeInTheDocument();
    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(3);
    // expect(within(listItems[1]).getByLabelText("delete")).toBeInTheDocument();
    // expect(within(listItems[3]).getByLabelText("delete")).toBeInTheDocument();
  });

  // it("shows create / delete buttons when user has write perms", async () => {
  //   await renderAndWait(
  //     <MockedProvider
  //       mocks={[mocks.tagsListQueryMock, mocks.writePermRepoRoleMock]}
  //     >
  //       <ReleaseList params={mocks.databaseParams} />
  //     </MockedProvider>,
  //   );

  //   expect(
  //     await screen.findByRole("button", {
  //       name: /create release/i,
  //     }),
  //   ).toBeInTheDocument();

  //   const row = screen.getAllByRole("listitem")[1];
  //   expect(within(row).getByLabelText("delete")).toBeInTheDocument();
  // });

  // it("does not show create / delete buttons when user has no write perms", async () => {
  //   await renderAndWait(
  //     <MockedProvider
  //       mocks={[mocks.tagsListQueryMock, mocks.noPermRepoRoleMock]}
  //     >
  //       <ReleaseList params={mocks.databaseParams} />
  //     </MockedProvider>,
  //   );

  //   expect(
  //     screen.queryByRole("button", {
  //       name: /create release/i,
  //     }),
  //   ).not.toBeInTheDocument();

  //   const rows = await screen.findAllByRole("listitem");
  //   expect(within(rows[1]).queryAllByRole("button").length).toBe(1);
  // });

  /**
   * Renders page with given mocked responses then clicks on the specified delete button and returns when modal is open.
   * @param mRs Array of mocked responses
   * @param getDeleteButton Function that returns the delete button. Called after the table is rendered.
   * @returns the heading of the delete modal
   */
  // async function openDeleteTagModal(
  //   mRs: MockedResponse[],
  //   getDeleteButton: () => Promise<HTMLElement>,
  // ): Promise<{ heading: HTMLElement; user: any }> {
  //   const { user } = await setupAndWait(
  //     <MockedProvider mocks={mRs}>
  //       <ReleaseList params={mocks.databaseParams} />
  //     </MockedProvider>,
  //   );

  //   const deleteButton = await getDeleteButton();
  //   await user.click(deleteButton);

  //   const heading = await screen.findByRole("heading", {
  //     name: /delete release/i,
  //   });

  //   return { heading, user };
  // }

  // it("deletes the correct tag", async () => {
  //   const tagToDelete = mocks.tag2;

  //   const getDeleteButton = async () => {
  //     const listItems = await screen.findAllByRole("listitem");
  //     return within(listItems[3]).getByLabelText("delete");
  //   };

  //   const { user } = await openDeleteTagModal(
  //     [
  //       mocks.tagsListQueryMock,
  //       mocks.buildDeleteTagMutationMock(tagToDelete.tagName),
  //       mocks.writePermRepoRoleMock,
  //     ],
  //     getDeleteButton,
  //   );

  //   await user.click(screen.getByRole("button", { name: /delete release/i }));

  //   // This will fail if the wrong branch is deleted because the mutation mock
  //   // is created with branchToDelete's branchName in variables.
  //   await waitFor(() =>
  //     expect(mocks.deleteTagNewData.mock.calls.length).toBe(1),
  //   );
  // });

  // it("does not delete a tag if model is just opened", async () => {
  //   const tagToDelete = mocks.tag2;

  //   const getDeleteButton = async () => {
  //     const listItems = await screen.findAllByRole("listitem");
  //     return within(listItems[3]).getByLabelText("delete");
  //   };

  //   const { heading, user } = await openDeleteTagModal(
  //     [
  //       mocks.tagsListQueryMock,
  //       mocks.buildDeleteTagMutationMock(tagToDelete.tagName),
  //       mocks.writePermRepoRoleMock,
  //     ],
  //     getDeleteButton,
  //   );

  //   await user.click(screen.getByRole("button", { name: /cancel/i }));
  //   await waitFor(() => expect(heading).not.toBeInTheDocument());

  //   expect(mocks.deleteTagNewData.mock.calls.length).toBe(0);
  // });
});
