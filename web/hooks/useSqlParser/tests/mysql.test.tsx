import { MockedProvider } from "@apollo/client/testing";
import { databaseDetailsMock } from "@components/util/NotDoltWrapper/mocks";
import compareArray from "@lib/compareArray";
import { renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import useSqlParser from "..";
import { fallbackGetTableNamesForSelect } from "../util";
import { mutationExamples } from "./mutationExamples";

const invalidQuery = `this is not a valid query`;

// TODO: Test postgres
function renderUseSqlParser() {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={[databaseDetailsMock(true, true, false)]}>
      {children}
    </MockedProvider>
  );

  const { result } = renderHook(() => useSqlParser(), { wrapper });
  return result.current;
}

describe("parse sql query", () => {
  it("check if the string contains multiple queries", () => {
    const { isMultipleQueries } = renderUseSqlParser();
    const twoQueries = `SELECT * FROM test; SELECT * FROM test2;`;
    expect(isMultipleQueries(twoQueries)).toBe(true);
    const singleQueries = `SELECT * FROM test`;
    expect(isMultipleQueries(singleQueries)).toBe(false);
    const queryWithSemicolon = `INSERT INTO test (pk, col1) VALUES(1,  'this has semicolon; should be false')`;
    expect(isMultipleQueries(queryWithSemicolon)).toBe(false);
    expect(isMultipleQueries(invalidQuery)).toBe(false);
  });

  it("gets the table name from a select query string for lunch-places", () => {
    const { getTableName } = renderUseSqlParser();

    const lpTableName = "lunch-places";
    const basicQuery = `SELECT * FROM \`${lpTableName}\``;
    expect(getTableName(basicQuery)).toBe(lpTableName);

    const queryWithCols = `SELECT name, \`type of food\`, rating FROM \`${lpTableName}\``;
    expect(getTableName(queryWithCols)).toBe(lpTableName);

    const queryWithWhereClause = `${queryWithCols} WHERE name = "Sidecar"`;
    expect(getTableName(queryWithWhereClause)).toBe(lpTableName);

    const queryWithNewLines = `SELECT *\nFROM \`${lpTableName}\`\nORDER BY rating DESC`;
    expect(getTableName(queryWithNewLines)).toBe(lpTableName);

    const queryWithColsAndWhereNotClause = `SELECT \`name\`, \`restaurant_name\`, \`identifier\`, \`fat_g\` FROM \`menu-items\` WHERE NOT (\`name\` = "APPLE SLICES" AND \`restaurant_name\` = "MCDONALD'S" AND \`identifier\` = "NATIONAL")`;
    expect(getTableName(queryWithColsAndWhereNotClause)).toBe("menu-items");

    expect(() => getTableName(invalidQuery)).not.toThrowError();
  });

  it("gets the table name for mutations", () => {
    const { getTableName } = renderUseSqlParser();
    expect(getTableName("DROP TABLE `test`")).toBe("test");
    expect(
      getTableName("INSERT INTO test (pk, col1) VALUES (1, 'string')"),
    ).toBe("test");
    expect(getTableName("CREATE TABLE `test table` (pk int primary key)")).toBe(
      "test table",
    );
    expect(getTableName("DELETE FROM test WHERE id=1")).toBe("test");
    expect(getTableName("ALTER TABLE `testing` DROP COLUMN `c1`")).toBe(
      "testing",
    );
    expect(
      getTableName("UPDATE `test` SET `pk` = '10' WHERE `pk` = '2'"),
    ).toEqual("test");
  });

  it("gets the table name from a select query string for dolt_commit_diff table", () => {
    const { getTableName } = renderUseSqlParser();
    const ddTableName = "dolt_commit_diff_career_totals_allstar";
    const basicQuery = `SELECT * FROM ${ddTableName}`;
    expect(getTableName(basicQuery)).toBe(ddTableName);

    const queryWithCols = `SELECT from_league_id, to_league_id FROM ${ddTableName}`;
    expect(getTableName(queryWithCols)).toBe(ddTableName);

    const queryWithWhereClause = `${queryWithCols} WHERE league_id = "00"`;
    expect(getTableName(queryWithWhereClause)).toBe(ddTableName);

    const queryWithNewLines = `SELECT *\nFROM ${ddTableName}\nORDER BY fg_pct DESC`;
    expect(getTableName(queryWithNewLines)).toBe(ddTableName);

    const queryWithNewLinesAndBackticks = `SELECT \`from_col1\`, \`to_col1\`, from_commit, from_commit_date, to_commit, to_commit_date, diff_type
    FROM \`dolt_commit_diff_foo\`
    WHERE (\`to_pk\` = "3" OR \`from_pk\` = "3") AND (\`from_col1\` <> \`to_col1\` OR (\`from_col1\` IS NULL AND \`to_col1\` IS NOT NULL) OR (\`from_col1\` IS NOT NULL AND \`to_col1\` IS NULL))
    ORDER BY to_commit_date DESC`;
    expect(getTableName(queryWithNewLinesAndBackticks)).toBe(
      "dolt_commit_diff_foo",
    );
  });

  it("gets query type", () => {
    const { getQueryType } = renderUseSqlParser();
    expect(getQueryType("SELECT * FROM tablename")).toEqual("select");
    expect(getQueryType("SHOW TABLES")).toEqual("show");
    expect(
      getQueryType("INSERT INTO tablename (id, name) values (1, 'taylor')"),
    ).toEqual("insert");
    expect(
      getQueryType("UPDATE tablename SET name='Taylor' WHERE id=1"),
    ).toEqual("update");
    expect(getQueryType("DELETE FROM tablename WHERE id=1")).toEqual("delete");
    expect(getQueryType("DROP TABLE tablename")).toEqual("drop");
    expect(
      getQueryType(
        "CREATE TABLE tablename (id INT, name VARCHAR(255), PRIMARY KEY(id))",
      ),
    ).toEqual("create");
    expect(() => getQueryType(invalidQuery)).not.toThrowError();
    expect(getQueryType(invalidQuery)).toEqual(undefined);
  });
});

describe("test isMutation", () => {
  const { isMutation } = renderUseSqlParser();
  const notMutations = [
    "SELECT * FROM tablename",
    "SHOW TABLES",
    "INVALID QUERY",
    "DESCRIBE tablename",
    "SHOW CREATE TABLE tablename",
    "SHOW CREATE VIEW `view_name`",
    "Select * from TABLE_NAME group by dept having salary > 10000;",
    `with oops as (
      SELECT from_name,to_ccn, to_name
      from dolt_commit_diff_hospitals where from_commit = 'qtd6vb07pq7bfgt67m863anntm6fpu7n'
      and to_commit = 'p730obnbmihnlq54uvenck13h12f7831'
      and from_name <> to_name
      )
      select h.*, o.* hospitals h
      join oops o
          on h.ccn = o.to_ccn
          and h.name <> o.from_name
      set h.name = o.from_name
`,
    "SHOW DATABASES",
    "SHOW COLUMNS FROM table_name",
    "SHOW INDEXES FROM table_name",
    "SHOW CREATE TABLE table_name",
    "SHOW TRIGGERS",
    "SHOW PROCEDURE STATUS",
    "SHOW FUNCTION STATUS",
    "SHOW GRANTS FOR user_name",
    "SHOW PROCESSLIST",
    "SHOW STATUS",
  ];
  notMutations.forEach(q => {
    it(`isMutation is false for "${q}"`, () => {
      expect(isMutation(q)).toBeFalsy();
    });
  });

  mutationExamples.forEach(q => {
    it(`isMutation is true for "${q}"`, () => {
      expect(isMutation(q)).toBeTruthy();
    });
  });

  it("doesn't throw error for invalid query", () => {
    expect(() => isMutation(invalidQuery)).not.toThrowError();
  });
});

describe("test use regex to get table names from query", () => {
  const tests = [
    {
      desc: "single table",
      query: "select * from tablename where col='name'",
      expected: ["tablename"],
    },
    {
      desc: "single table with where clause",
      query: "select * from tablename where col='name'",
      expected: ["tablename"],
    },
    {
      desc: "multiple tables using , to join",
      query: "select * from table1, table2 where table1.id = table2.id",
      expected: ["table1", "table2"],
    },
    {
      desc: "multiple tables using join clause",
      query: "select * from table1 join table2 on table1.id = table2.id",
      expected: ["table1", "table2"],
    },
    {
      desc: "multiple tables with table names in backticks",
      query:
        "select * from `table1` join `table2` on `table1`.id = `table2`.id",
      expected: ["table1", "table2"],
    },
    {
      desc: "multiple tables with column name includes from",
      query:
        "select * from table1 join table2 on table1.from_commit = table2.from_commit",
      expected: ["table1", "table2"],
    },
    // {
    //   desc: "more than 2 tables",
    //   query:
    //     "select * from table1, table2, table3 where table1.id = table2.id and table2.id = table3.id",
    //   expected: ["table1", "table2", "table3"],
    // },
  ];
  tests.forEach(test => {
    it(test.desc, () => {
      expect(
        compareArray(fallbackGetTableNamesForSelect(test.query), test.expected),
      ).toBe(true);
    });
  });
});
