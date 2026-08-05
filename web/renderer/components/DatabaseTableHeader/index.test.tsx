import { MockedProvider } from "@apollo/client/testing";
import { databaseDetailsMock } from "@components/util/NotDoltWrapper/mocks";
import { DataTableContext } from "@contexts/dataTable";
import { SqlEditorProvider } from "@contexts/sqleditor";
import useMockRouter from "@hooks/useMockRouter";
import { DatabasePageParams } from "@lib/params";
import { setupAndWait } from "@lib/testUtils.test";
import { screen } from "@testing-library/react";
import DatabaseTableHeader from ".";
import { sampleCreateQueryForEmpty } from "./useSqlStrings";

const dataTableCtxMock = {
  params: { databaseName: "test", refName: "main" },
  loading: false,
  loadingWorkingDiff: false,
  loadMore: async () => {},
  loadMoreWorkingDiff: async () => {},
  hasMore: false,
  hasMoreWorkingDiff: false,
  showingWorkingDiff: false,
  tableNames: [],
  onAddEmptyRow: () => {},
  setPendingRow: () => {},
  setWorkingDiffRowsToggled: () => {},
  diffExists: false,
  tableShape: true,
  isMutation: false,
  setIsMutation: () => {},
};

const dbParams = {
  databaseName: "test",
  refName: "main",
  schemaName: "mysch",
};

const jestRouter = jest.spyOn(require("next/router"), "useRouter");

jest.mock("next/router", () => {
  return {
    useRouter: () => {
      return { route: "", pathname: "", query: "", asPath: "" };
    },
  };
});

async function renderAndTestComponent(
  params: DatabasePageParams,
  expectedCopiedQuery: string,
  empty = false,
  executedQueryString?: string,
) {
  const ctx = { ...dataTableCtxMock, executedQueryString };
  const { user } = await setupAndWait(
    <MockedProvider mocks={[databaseDetailsMock(true, true, false)]}>
      <DataTableContext.Provider value={ctx}>
        <SqlEditorProvider params={params}>
          <DatabaseTableHeader params={params} empty={empty} />
        </SqlEditorProvider>
      </DataTableContext.Provider>
    </MockedProvider>,
  );

  expect(screen.getByText("Query")).toBeInTheDocument();
  expect(await screen.findByText("Create View")).toBeInTheDocument();
  expect(screen.getByText("Copy")).toBeInTheDocument();
  const button = screen.getByText("Copy");
  window.prompt = jest.fn();

  expect(button).toHaveTextContent("Copy");

  await user.click(button);

  expect(button).toHaveTextContent("Copied");
  expect(window.prompt).toHaveBeenCalledWith(
    "Copy to clipboard: Ctrl+C, Enter",
    expectedCopiedQuery,
  );
}

describe("test DatabaseTableHeader", () => {
  it("empty editor when no q, no executed query, and not empty mode", async () => {
    useMockRouter(jestRouter, {});
    await renderAndTestComponent(dbParams, "\n\n\n\n");
  });

  it("uses params.q when provided", async () => {
    useMockRouter(jestRouter, {});
    await renderAndTestComponent(
      { ...dbParams, q: "SELECT * FROM tablename WHERE id=2" },
      "SELECT * FROM tablename WHERE id=2",
    );
  });

  it("falls back to executedQueryString from context", async () => {
    useMockRouter(jestRouter, {});
    await renderAndTestComponent(
      { ...dbParams, tableName: "my table" },
      "SELECT * FROM `my table`\n\n\n\n",
      false,
      "SELECT * FROM `my table`",
    );
  });

  it("uses sampleCreateQueryForEmpty for empty database", async () => {
    useMockRouter(jestRouter, {});
    await renderAndTestComponent(dbParams, sampleCreateQueryForEmpty(), true);
  });
});
