import { MockedProvider } from "@apollo/client/testing";
import { commitError } from "@hooks/useCommitListForBranch/mocks";
import { setup } from "@lib/testUtils.test";
import { screen } from "@testing-library/react";
import BranchAndCommitSelector from "../BranchAndCommitSelector";
import * as mocks from "./mocks";
import { testRenderComponent } from "./utils.test";

describe("test BranchAndCommitSelector", () => {
  mocks.branchAndCommitTests.forEach(test => {
    it(`renders for ${test.desc}`, async () => {
      const onChangeValue = jest.fn();

      const { user } = setup(
        <MockedProvider
          mocks={mocks.getBranchAndCommitMocks(
            mocks.fakeRefParams,
            test.error,
            test.empty,
          )}
        >
          <BranchAndCommitSelector
            onChangeValue={onChangeValue}
            selectedValue={test.value}
            params={mocks.fakeRefParams}
          />
        </MockedProvider>,
      );

      expect(
        screen.getByText("Pick a branch or recent commit"),
      ).toBeInTheDocument();

      await testRenderComponent(test, user, "Commit", commitError, async v => {
        expect(onChangeValue).toHaveBeenLastCalledWith(v);
      });
    });
  });
});
