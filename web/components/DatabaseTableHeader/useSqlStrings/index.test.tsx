import { MockedProvider } from "@apollo/client/testing";
import { databaseDetailsMock } from "@components/util/NotDoltWrapper/mocks";
import { SqlEditorProvider } from "@contexts/sqleditor";
import useMockRouter from "@hooks/useMockRouter";
import { renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { DEFAULT_LIMIT, Params, useSqlStrings } from ".";

const jestRouter = jest.spyOn(require("next/router"), "useRouter");

jest.mock("next/router", () => {
  return {
    useRouter: () => {
      return { route: "", pathname: "", query: "", asPath: "" };
    },
  };
});

function renderUseSqlStrings(
  params: Params,
  empty = false,
  isPostgres = false,
) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={[databaseDetailsMock(true, true, isPostgres)]}>
      <SqlEditorProvider>{children}</SqlEditorProvider>
    </MockedProvider>
  );

  const { result } = renderHook(() => useSqlStrings(params, empty), {
    wrapper,
  });
  return result.current;
}

describe("tests useSqlStrings", () => {
  const tests: Array<{
    desc: string;
    expectedQuery: string;
    tableName?: string;
  }> = [
    {
      desc: "Keyless table",
      expectedQuery: `SELECT * FROM \`Keyless table\` LIMIT ${DEFAULT_LIMIT}`,
      tableName: "Keyless table",
    },
    {
      desc: "One key and data",
      expectedQuery: `SELECT * FROM \`One key and data table\` LIMIT ${DEFAULT_LIMIT}`,
      tableName: "One key and data table",
    },
    {
      desc: "Two Key",
      expectedQuery: `SELECT * FROM \`Two Keys table\` LIMIT ${DEFAULT_LIMIT}`,
      tableName: "Two Keys table",
    },
    {
      desc: "Two Keys and data",
      expectedQuery: `SELECT * FROM \`Two Keys and data table\` LIMIT ${DEFAULT_LIMIT}`,
      tableName: "Two Keys and data table",
    },
    {
      desc: "no table name",
      expectedQuery: `SHOW TABLES;`,
    },
  ];

  tests.forEach(test => {
    it(`tests ${test.desc} table default query`, () => {
      useMockRouter(jestRouter, {});
      const { editorString } = renderUseSqlStrings({
        databaseName: "test",
        tableName: test.tableName,
      });
      expect(editorString.trim()).toEqual(test.expectedQuery);
    });
  });

  it("empty table returns create table statement", () => {
    useMockRouter(jestRouter, {});
    const { editorString } = renderUseSqlStrings(
      {
        databaseName: "test",
      },
      true,
    );
    expect(editorString.trim()).toEqual(`CREATE TABLE tablename (
  pk INT,
  col1 VARCHAR(255),
  PRIMARY KEY (pk)
);`);
  });
});
