import { MockedProvider } from "@apollo/client/testing";
import useMockRouter from "@hooks/useMockRouter";
import { setup } from "@lib/testUtils.test";
import { database } from "@lib/urls";
import { screen, waitFor } from "@testing-library/react";
import CustomFormSelect from "..";
import * as mocks from "../mocks";

const jestRouter = jest.spyOn(require("next/router"), "useRouter");

jest.mock("next/router", () => {
  return {
    useRouter: () => {
      return { route: "", pathname: "", query: "", asPath: "" };
    },
  };
});

describe("test CustomFormSelect.ForBranches", () => {
  mocks.branchTests.forEach(test => {
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

      const url = database(mocks.fakeParams);
      useMockRouter(jestRouter, {
        asPath: url.asPathname(),
        pathname: url.hrefPathname(),
      });

      const { user } = setup(
        <MockedProvider
          mocks={[
            mocks.defaultBranchQuery,
            test.error
              ? mocks.errorMock(mocks.fakeParams)
              : mocks.branchSelectorMock(mocks.fakeParams, test.empty),
          ]}
        >
          <CustomFormSelect.ForBranches
            {...propsToFormSelect}
            params={mocks.fakeParams}
            showLabel
            autoFocus
            useValueAsSingleValue
          />
        </MockedProvider>,
      );

      if (test.error) {
        await waitFor(() =>
          expect(screen.getByText(mocks.branchError)).toBeVisible(),
        );
      } else if (test.empty) {
        await waitFor(() =>
          expect(screen.getByText("No branches found")).toBeVisible(),
        );
      } else {
        await waitFor(() =>
          expect(screen.getByRole("button", { name: "Commits" })).toBeVisible(),
        );
        expect(screen.getByRole("button", { name: "Branches" })).toBeVisible();
        const selected =
          test.selected === "" ? "select a branch..." : test.selected;
        expect(screen.getByText(selected)).toBeVisible();

        expect(user.click(screen.getByLabelText("main")));
        await waitFor(() => expect(onChangeValue).toBeCalled());
      }
    });
  });
});
