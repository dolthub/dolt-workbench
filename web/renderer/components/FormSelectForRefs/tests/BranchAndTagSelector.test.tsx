import { MockedProvider } from "@apollo/client/testing";
import { tagError } from "@components/pageComponents/DatabasePage/ForReleases/ReleaseList/mocks";
import useMockRouter, { actions } from "@hooks/useMockRouter";
import { setup } from "@lib/testUtils.test";
import { ref, table } from "@lib/urls";
import BranchAndTagSelector from "../BranchAndTagSelector";
import * as mocks from "./mocks";
import {
  testRenderComponent,
  testValueToSelect,
  waitForVisibleValueToClick,
} from "./utils.test";

const jestRouter = jest.spyOn(require("next/router"), "useRouter");

jest.mock("next/router", () => {
  return {
    useRouter: () => {
      return { route: "", pathname: "", query: "", asPath: "" };
    },
  };
});

describe("test BranchAndTagSelector", () => {
  mocks.branchAndTagTests.forEach(test => {
    it(`renders for ${test.desc}`, async () => {
      useMockRouter(jestRouter, {});

      const { user } = setup(
        <MockedProvider
          mocks={mocks.getBranchAndTagMocks(
            mocks.fakeRefParams,
            test.error,
            test.empty,
          )}
        >
          <BranchAndTagSelector
            routeRefChangeTo={p => ref(p)}
            selectedValue={test.value}
            params={mocks.fakeRefParams}
          />
        </MockedProvider>,
      );

      await testRenderComponent(test, user, "Tag", tagError, async v => {
        const { href, as } = ref({
          ...mocks.fakeParams,
          refName: v,
        });
        expect(actions.push).toHaveBeenCalledWith(href, as);
      });
    });
  });

  it("handles table not existing on new branch", async () => {
    useMockRouter(jestRouter, {});
    const refName = "main";
    const refToSelect = "test";
    const tableName = "testtable";
    const tableParams = { ...mocks.fakeParams, refName, tableName };

    const { user } = setup(
      <MockedProvider
        mocks={[
          ...mocks.getBranchAndTagMocks(tableParams),
          mocks.tableListEmptyMock({
            ...mocks.fakeParams,
            refName: refToSelect,
          }),
        ]}
      >
        <BranchAndTagSelector
          routeRefChangeTo={p => table({ ...p, tableName })}
          selectedValue={refName}
          params={tableParams}
        />
      </MockedProvider>,
    );

    await waitForVisibleValueToClick(user, refName, "tag");

    await testValueToSelect(refToSelect, user, async v => {
      const { href, as } = ref({
        ...mocks.fakeParams,
        refName: v,
      });

      expect(actions.push).toHaveBeenCalledWith(href, as);
    });
  });

  it("handles table existing on new branch", async () => {
    useMockRouter(jestRouter, {});
    const refName = "main";
    const refToSelect = "test";
    const tableName = "testtable";
    const tableParams = { ...mocks.fakeParams, refName, tableName };

    const { user } = setup(
      <MockedProvider
        mocks={[
          ...mocks.getBranchAndTagMocks(tableParams),
          mocks.tableListMock({
            ...mocks.fakeParams,
            refName: refToSelect,
            tableName,
          }),
        ]}
      >
        <BranchAndTagSelector
          routeRefChangeTo={p => table({ ...p, tableName })}
          selectedValue={refName}
          params={tableParams}
        />
      </MockedProvider>,
    );

    await waitForVisibleValueToClick(user, refName, "tag");

    await testValueToSelect(refToSelect, user, async v => {
      const { href, as } = table({
        ...mocks.fakeParams,
        refName: v,
        tableName,
      });

      expect(actions.push).toHaveBeenCalledWith(href, as);
    });
  });
});
