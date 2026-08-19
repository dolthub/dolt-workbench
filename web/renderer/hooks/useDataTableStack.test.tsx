import { actions } from "@hooks/useMockRouter";
import { act, renderHook } from "@testing-library/react";
import useDataTableStack from "./useDataTableStack";

const jestRouter = jest.spyOn(require("next/router"), "useRouter");

jest.mock("@contexts/dataTable", () => {
  return {
    useDataTableContext: () => {
      return { columns: [] };
    },
  };
});

jest.mock("next/router", () => {
  return {
    useRouter: () => {
      return { pathname: "", query: {} };
    },
  };
});

describe("useDataTableStack", () => {
  beforeEach(() => {
    actions.push.mockClear();
  });

  it("clears table view parameters while preserving route parameters", () => {
    jestRouter.mockImplementation(() => {
      return {
        pathname: "/database/[databaseName]/data/[refName]/[tableName]",
        query: {
          databaseName: "mydb",
          refName: "main",
          tableName: "employees",
          where: "name.Ada",
          orderBy: "id.asc",
        },
        push: actions.push,
      };
    });
    const { result } = renderHook(() => useDataTableStack());

    act(() => result.current.reset());

    expect(actions.push).toHaveBeenCalledWith({
      pathname: "/database/[databaseName]/data/[refName]/[tableName]",
      query: {
        databaseName: "mydb",
        refName: "main",
        tableName: "employees",
        where: undefined,
        orderBy: undefined,
        hide: undefined,
        projection: undefined,
      },
    });
  });

  it("does not navigate when the table view is already unfiltered", () => {
    jestRouter.mockImplementation(() => {
      return {
        pathname: "/database/[databaseName]/data/[refName]/[tableName]",
        query: {
          databaseName: "mydb",
          refName: "main",
          tableName: "employees",
        },
        push: actions.push,
      };
    });
    const { result } = renderHook(() => useDataTableStack());

    act(() => result.current.reset());

    expect(actions.push).not.toHaveBeenCalled();
  });
});
