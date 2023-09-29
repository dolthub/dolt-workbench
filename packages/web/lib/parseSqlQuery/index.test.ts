import {
  convertToSqlWithNewCondition,
  convertToSqlWithOrderBy,
  getQueryType,
  getTableName,
  isMultipleQueries,
  isMutation,
  makeQueryExecutable,
  removeColumnFromQuery,
} from ".";
import { NULL_VALUE } from "../null";
import { mutationExamples } from "./mutationExamples";

const invalidQuery = `this is not a valid query`;

describe("parse sql query", () => {
  it("check if the string contains multiple queries", () => {
    const twoQueries = `SELECT * FROM test; SELECT * FROM test2;`;
    expect(isMultipleQueries(twoQueries)).toBe(true);
    const singleQueries = `SELECT * FROM test`;
    expect(isMultipleQueries(singleQueries)).toBe(false);
    const queryWithSemicolon = `INSERT INTO test (pk, col1) VALUES(1,  'this has semicolon; should be false')`;
    expect(isMultipleQueries(queryWithSemicolon)).toBe(false);
    expect(isMultipleQueries(invalidQuery)).toBe(false);
  });

  it("gets the table name from a select query string for lunch-places", () => {
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

  it("adds a new condition to a query string for null and non-null values", () => {
    const column = "rating";
    const value = "10";
    const nullVal = NULL_VALUE;
    const condition = `\`${column}\` = '${value}'`;
    const conditionNullVal = `\`${column}\` IS NULL`;

    const query = "SELECT * FROM `lunch-places`";
    const expectedNoConditions = `${query} WHERE ${condition}`;
    expect(convertToSqlWithNewCondition(query, column, value)).toBe(
      expectedNoConditions,
    );

    const expectedNoConditionsNullVal = `${query} WHERE ${conditionNullVal}`;
    expect(convertToSqlWithNewCondition(query, column, nullVal)).toBe(
      expectedNoConditionsNullVal,
    );

    const queryWithCondition = `${query} WHERE \`type of food\` = 'mexican'`;
    const expectedWithCondition = `${queryWithCondition} AND ${condition}`;
    expect(
      convertToSqlWithNewCondition(queryWithCondition, column, value),
    ).toBe(expectedWithCondition);

    const expectedWithConditionNullVal = `${queryWithCondition} AND ${conditionNullVal}`;
    expect(
      convertToSqlWithNewCondition(queryWithCondition, column, nullVal),
    ).toBe(expectedWithConditionNullVal);

    const queryWithConditions = `${query} WHERE (\`type of food\` = 'mexican' OR \`best dish\` = 'burrito')`;
    const expectedWithConditions = `${queryWithConditions} AND ${condition}`;
    expect(
      convertToSqlWithNewCondition(queryWithConditions, column, value),
    ).toBe(expectedWithConditions);

    const expectedWithConditionsNullVal = `${queryWithConditions} AND ${conditionNullVal}`;
    expect(
      convertToSqlWithNewCondition(queryWithConditions, column, nullVal),
    ).toBe(expectedWithConditionsNullVal);

    const queryWithConditionAndLimit = `${query} WHERE \`type of food\` = 'mexican' LIMIT 100`;
    const expectedWithConditionAndLimit = `${query} WHERE \`type of food\` = 'mexican' AND ${condition} LIMIT 100`;
    expect(
      convertToSqlWithNewCondition(queryWithConditionAndLimit, column, value),
    ).toBe(expectedWithConditionAndLimit);

    const expectedWithConditionAndLimitNullVal = `${query} WHERE \`type of food\` = 'mexican' AND ${conditionNullVal} LIMIT 100`;
    expect(
      convertToSqlWithNewCondition(queryWithConditionAndLimit, column, nullVal),
    ).toBe(expectedWithConditionAndLimitNullVal);

    expect(() =>
      convertToSqlWithNewCondition(invalidQuery, column, value),
    ).not.toThrowError();
  });

  it("adds or removes order by clause to query", () => {
    const column = "name";
    const type = "ASC";
    const query = "SELECT * FROM `lunch-places`";
    const expectedNoOrderBy = `${query} ORDER BY \`${column}\` ${type}`;
    expect(convertToSqlWithOrderBy(query, column, type)).toBe(
      expectedNoOrderBy,
    );
    expect(convertToSqlWithOrderBy(expectedNoOrderBy, column)).toBe(query);

    const queryOrderBy = `${query} ORDER BY \`rating\` ASC`;
    const expectedOrderBy = `${queryOrderBy}, \`${column}\` ${type}`;
    expect(convertToSqlWithOrderBy(queryOrderBy, column, type)).toBe(
      expectedOrderBy,
    );
    expect(convertToSqlWithOrderBy(expectedOrderBy, column)).toBe(queryOrderBy);

    const queryOrderBySameCol = `${query} ORDER BY \`${column}\` DESC`;
    const expectedOrderBySameCol = `${query} ORDER BY \`${column}\` ${type}`;
    expect(convertToSqlWithOrderBy(queryOrderBySameCol, column, type)).toBe(
      expectedOrderBySameCol,
    );
    expect(convertToSqlWithOrderBy(expectedOrderBySameCol, column)).toBe(query);

    const queryOrderBySameColSameOrder = `${query} ORDER BY \`${column}\` DESC, \`rating\` ASC LIMIT 20`;
    const expectedOrderBySameColSameOrder = `${query} ORDER BY \`${column}\` ${type}, \`rating\` ASC LIMIT 20`;
    const expectedQueryRemoved = `${query} ORDER BY \`rating\` ASC LIMIT 20`;
    expect(
      convertToSqlWithOrderBy(queryOrderBySameColSameOrder, column, type),
    ).toBe(expectedOrderBySameColSameOrder);
    expect(
      convertToSqlWithOrderBy(expectedOrderBySameColSameOrder, column),
    ).toBe(expectedQueryRemoved);

    expect(() =>
      convertToSqlWithOrderBy(invalidQuery, column),
    ).not.toThrowError();
  });

  it("gets query type", () => {
    expect(getQueryType("SELECT * FROM tablename")).toEqual("select");
    expect(getQueryType("SHOW TABLES")).toEqual(undefined);
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

describe("removes column from query", () => {
  const tests: Array<{
    desc: string;
    query: string;
    colToRemove: string;
    cols: string[];
    expected: string;
  }> = [
    {
      desc: "select query",
      query: "SELECT * FROM tablename",
      colToRemove: "name",
      cols: ["id", "name"],
      expected: "SELECT `id` FROM `tablename`",
    },
    {
      desc: "select query with where clause",
      query: "SELECT id, name, age FROM tablename WHERE id=1",
      colToRemove: "id",
      cols: ["id", "name", "age"],
      expected: "SELECT `name`, `age` FROM `tablename` WHERE `id` = 1",
    },
    {
      desc: "select query with where not clause with double quoted single quote",
      query: `SELECT id, name, age FROM tablename WHERE NOT (id=1 AND name = "MCDONALD'S")`,
      colToRemove: "name",
      cols: ["id", "name", "age"],
      expected: `SELECT \`id\`, \`age\` FROM \`tablename\` WHERE NOT(\`id\` = 1 AND \`name\` = 'MCDONALD\\'S')`,
    },
    {
      desc: "select query with where clause with escaped single quote",
      query: `SELECT * FROM tablename WHERE name = 'MCDONALD\\'S'`,
      colToRemove: "age",
      cols: ["id", "name", "age"],
      expected: `SELECT \`id\`, \`name\` FROM \`tablename\` WHERE \`name\` = 'MCDONALD\\'S'`,
    },
    {
      desc: "select query with where clause with two escaped single quotes",
      query: `SELECT * FROM tablename WHERE name = 'MCDONALD\\'S' OR name = 'Jinky\\'s Cafe'`,
      colToRemove: "age",
      cols: ["id", "name", "age"],
      expected: `SELECT \`id\`, \`name\` FROM \`tablename\` WHERE \`name\` = 'MCDONALD\\'S' OR \`name\` = 'Jinky\\'s Cafe'`,
    },
  ];

  tests.forEach(test => {
    it(test.desc, () => {
      expect(
        removeColumnFromQuery(test.query, test.colToRemove, test.cols),
      ).toEqual(test.expected);
    });
  });

  expect(() =>
    removeColumnFromQuery(invalidQuery, "age", ["id", "age"]),
  ).not.toThrowError();
});

describe("test executable query", () => {
  const tests = [
    {
      desc: "escapes single quotes",
      query: "select * from tablename where col='name'",
    },
    {
      desc: "removes extra whitespace",
      query: ` select *
from tablename
where col='name'
      
      `,
    },
  ];
  tests.forEach(test => {
    it(test.desc, () => {
      expect(makeQueryExecutable(test.query)).toEqual(
        "select * from tablename where col=\\'name\\'",
      );
    });
  });
});
