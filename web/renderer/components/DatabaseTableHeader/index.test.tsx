import { MockedProvider } from "@apollo/client/testing";
import { databaseDetailsMock } from "@components/util/NotDoltWrapper/mocks";
import { DataTableContext } from "@contexts/dataTable";
import { SqlEditorProvider } from "@contexts/sqleditor";
import useMockRouter from "@hooks/useMockRouter";
import { DatabasePageParams } from "@lib/params";
import { setupAndWait } from "@lib/testUtils.test";
import { screen } from "@testing-library/react";
import DatabaseTableHeader from ".";
import { DEFAULT_LIMIT, sampleCreateQueryForEmpty } from "./useSqlStrings";

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
};

const dbParams = {
  databaseName: "test",
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
  isPostgres = false,
) {
  const { user } = await setupAndWait(
    <MockedProvider mocks={[databaseDetailsMock(true, true, isPostgres)]}>
      <DataTableContext.Provider value={dataTableCtxMock}>
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
  const writeText = jest.fn().mockResolvedValue(undefined);
  Object.defineProperty(window.navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });

  expect(button).toHaveTextContent("Copy");

  await user.click(button);

  expect(button).toHaveTextContent("Copied");
  expect(writeText).toHaveBeenCalledWith(expectedCopiedQuery);
}

describe("test DatabaseTableHeader", () => {
  const tests = [
    {
      desc: "no table",
      params: dbParams,
      expected: "SHOW TABLES;\n\n\n\n",
      expectedPostgres: `SELECT *
FROM pg_catalog.pg_tables
where schemaname='${dbParams.schemaName}';\n\n\n\n`,
    },
    {
      desc: "with table",
      params: { ...dbParams, tableName: "my table" },
      expected: `SELECT * FROM \`my table\` LIMIT ${DEFAULT_LIMIT}\n\n\n\n`,
      expectedPostgres: `SELECT * FROM "my table" LIMIT ${DEFAULT_LIMIT}\n\n\n\n`,
    },
    {
      desc: "with dolt system table",
      params: { ...dbParams, tableName: "dolt_docs" },
      expected: "SHOW TABLES;\n\n\n\n",
      expectedPostgres: `SELECT *
FROM pg_catalog.pg_tables
where schemaname='${dbParams.schemaName}';\n\n\n\n`,
    },
    {
      desc: "with query and table",
      params: {
        ...dbParams,
        tableName: "my table",
        q: "SELECT * FROM tablename WHERE id=2",
      },
      expected: "SELECT * FROM tablename WHERE id=2",
      expectedPostgres: "SELECT * FROM tablename WHERE id=2",
    },
    {
      desc: "for empty database",
      params: dbParams,
      expected: sampleCreateQueryForEmpty(),
      expectedPostgres: sampleCreateQueryForEmpty(),
      empty: true,
    },
  ];

  tests.forEach(test => {
    it(`${test.desc}, mysql`, async () => {
      useMockRouter(jestRouter, {});
      await renderAndTestComponent(test.params, test.expected, test.empty);
    });

    it(`${test.desc}, postgres`, async () => {
      useMockRouter(jestRouter, {});
      await renderAndTestComponent(
        test.params,
        test.expectedPostgres,
        test.empty,
        true,
      );
    });
  });
});
