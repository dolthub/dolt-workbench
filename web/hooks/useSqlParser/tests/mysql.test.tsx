import compareArray from "@lib/compareArray";
import { fallbackGetTableNamesForSelect } from "../util";
import { renderUseSqlParser } from "./render.test";
import {
  getParserCol,
  invalidQuery,
  mutationExamples,
  notMutationExamples,
} from "./testData";

describe("parse sql query", () => {
  it("check if the string contains multiple queries", async () => {
    const { isMultipleQueries } = await renderUseSqlParser();
    const twoQueries = `SELECT * FROM test; SELECT * FROM test2;`;
    expect(isMultipleQueries(twoQueries)).toBe(true);
    const singleQueries = `SELECT * FROM test`;
    expect(isMultipleQueries(singleQueries)).toBe(false);
    const queryWithSemicolon = `INSERT INTO test (pk, col1) VALUES(1,  'this has semicolon; should be false')`;
    expect(isMultipleQueries(queryWithSemicolon)).toBe(false);
    expect(isMultipleQueries(invalidQuery)).toBe(false);
  });

  it("gets the table name from a select query string for lunch-places", async () => {
    const { getTableName } = await renderUseSqlParser();

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

  it("gets the table name for mutations", async () => {
    const { getTableName } = await renderUseSqlParser();
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

  it("gets the table name from a select query string for dolt_commit_diff table", async () => {
    const { getTableName } = await renderUseSqlParser();
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

  it("gets query type", async () => {
    const { getQueryType } = await renderUseSqlParser();
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
  notMutationExamples.forEach(q => {
    it(`isMutation is false for "${q}"`, async () => {
      const { isMutation } = await renderUseSqlParser();
      expect(isMutation(q)).toBeFalsy();
    });
  });

  mutationExamples.forEach(q => {
    it(`isMutation is true for "${q}"`, async () => {
      const { isMutation } = await renderUseSqlParser();
      expect(isMutation(q)).toBeTruthy();
    });
  });

  it("doesn't throw error for invalid query", async () => {
    const { isMutation } = await renderUseSqlParser();
    expect(() => isMutation(invalidQuery)).not.toThrow();
  });
});

describe("test fallbackGetTableNamesForSelect", () => {
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
        compareArray(
          fallbackGetTableNamesForSelect(test.query, false),
          test.expected,
        ),
      ).toBe(true);
    });
  });
});

describe("test queryHasOrderBy", () => {
  const tests = [
    {
      desc: "no order by",
      query: "select * from `test`",
      column: "test",
      expectedDef: true,
      expectedAsc: false,
      expectedDesc: false,
    },
    {
      desc: "order by, column doesn't match",
      query: "select * from `test` ORDER BY `other-col` ASC",
      column: "not-col",
      expectedDef: true,
      expectedAsc: false,
      expectedDesc: false,
    },
    {
      desc: "order by, column matches, desc",
      query: "select * from `test` ORDER BY `my-col` DESC",
      column: "my-col",
      expectedDef: false,
      expectedAsc: false,
      expectedDesc: true,
    },
    {
      desc: "order by, column matches, asc",
      query: "select * from `test` ORDER BY `my-col` ASC",
      column: "my-col",
      expectedDef: false,
      expectedAsc: true,
      expectedDesc: false,
    },
    {
      desc: "invalid query",
      query: invalidQuery,
      column: "my-col",
      expectedDef: false,
      expectedAsc: false,
      expectedDesc: false,
    },
  ];

  tests.forEach(test => {
    it(test.desc, async () => {
      const { queryHasOrderBy } = await renderUseSqlParser();
      // Default
      expect(queryHasOrderBy(test.query, test.column)).toBe(test.expectedDef);
      // ASC
      expect(queryHasOrderBy(test.query, test.column, "ASC")).toBe(
        test.expectedAsc,
      );
      // DESC
      expect(queryHasOrderBy(test.query, test.column, "DESC")).toBe(
        test.expectedDesc,
      );
    });
  });
});

describe("test getColumns", () => {
  const tests = [
    {
      desc: "select *",
      query: "select * from `test`",
      expected: [getParserCol("*")],
    },
    {
      desc: "select one column",
      query: "select `col1` from `test`",
      expected: [getParserCol("col1")],
    },
    {
      desc: "select two columns",
      query: "select `col1`, `col2` from `test`",
      expected: [getParserCol("col1"), getParserCol("col2")],
    },
    {
      desc: "update query",
      query: "update `test` set `col1` = 'val1', `col2` = 'val2'",
      expected: undefined,
    },
    {
      desc: "invalid query",
      query: invalidQuery,
      expected: undefined,
    },
  ];

  tests.forEach(test => {
    it(test.desc, async () => {
      const { getColumns } = await renderUseSqlParser();
      expect(getColumns(test.query)).toEqual(test.expected);
    });
  });
});
