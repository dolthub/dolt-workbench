import { MockedProvider } from "@apollo/client/testing";
import { setup } from "@lib/testUtils.test";
import { screen, waitFor } from "@testing-library/react";
import CommitSelector from "../CommitSelector";
import * as mocks from "../mocks";

describe("test CustomFormSelect.ForCommits", () => {
  mocks.commitTests.forEach(test => {
    it(`render Selector ${test.title}`, async () => {
      const onChangeValue = jest.fn();

      const propsToFormSelect = {
        tabs: [
          {
            label: "Branches",
            active: true,
            onClick: jest.fn(),
          },
          {
            label: "Commits",
            active: false,
            onClick: jest.fn(),
          },
        ],
        selectedValue: test.selected,
        onChangeValue,
        customDropdown: true,
      };

      const { user } = setup(
        <MockedProvider
          mocks={
            test.error
              ? mocks.mockCommitError()
              : mocks.commitsListMock(test.empty)
          }
        >
          <CommitSelector
            {...propsToFormSelect}
            params={{
              ...mocks.fakeParams,
              refName: mocks.fakeBranchName,
            }}
            showLabel
            autoFocus
            useValueAsSingleValue
          />
        </MockedProvider>,
      );

      if (test.error) {
        await waitFor(() =>
          expect(screen.getByText(mocks.commitError)).toBeVisible(),
        );
      } else if (test.empty) {
        await waitFor(() =>
          expect(screen.getByText("No commits found")).toBeVisible(),
        );
      } else {
        const selected = test.selected === "" ? "Select..." : test.selected;

        await waitFor(() => expect(screen.getByText(selected)).toBeVisible());
        await waitFor(() =>
          expect(
            screen.getByLabelText(mocks.commitPicked.commitId),
          ).toBeVisible(),
        );

        expect(screen.getByRole("button", { name: "Branches" })).toBeVisible();
        expect(screen.getByRole("button", { name: "Commits" })).toBeVisible();

        expect(user.click(screen.getByLabelText(mocks.commitPicked.commitId)));

        await waitFor(() =>
          expect(onChangeValue).toHaveBeenLastCalledWith(
            mocks.commitPicked.commitId,
          ),
        );
      }
    });
  });
});
