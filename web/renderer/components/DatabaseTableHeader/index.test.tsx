import { MockedProvider } from "@apollo/client/testing";
import { databaseDetailsMock } from "@components/util/NotDoltWrapper/mocks";
import { SqlEditorProvider } from "@contexts/sqleditor";
import useMockRouter from "@hooks/useMockRouter";
import { DatabasePageParams } from "@lib/params";
import { setupAndWait } from "@lib/testUtils.test";
import { screen } from "@testing-library/react";
import DatabaseTableHeader from ".";
import { DEFAULT_LIMIT, sampleCreateQueryForEmpty } from "./useSqlStrings";

const dbParams = {
  connectionName: "connection",
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
      <SqlEditorProvider params={params}>
        <DatabaseTableHeader params={params} empty={empty} />
      </SqlEditorProvider>
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
