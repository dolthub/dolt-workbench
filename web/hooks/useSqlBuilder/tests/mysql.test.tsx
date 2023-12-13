import { MockedProvider } from "@apollo/client/testing";
import { toPKCols } from "@components/CellButtons/queryHelpers";
import { databaseDetailsMock } from "@components/util/NotDoltWrapper/mocks";
import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import { NULL_VALUE } from "@lib/null";
import { TableParams } from "@lib/params";
import { renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import useSqlBuilder from "..";
import { Conditions } from "../util";
import * as td from "./testData";

function renderUseSqlBuilder(isPostgres = false) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={[databaseDetailsMock(true, true, isPostgres)]}>
      {children}
    </MockedProvider>
  );

  const { result } = renderHook(() => useSqlBuilder(), { wrapper });
  return result.current;
}

describe("test addWhereClauseToSelect", () => {
  const column = "rating";
  const value = "10";
  const nullVal = NULL_VALUE;
  const tableName = "lunch-places";
  const condition = `\`${column}\` = '${value}'`;
  const conditionNullVal = `\`${column}\` IS NULL`;
  const cond = [{ col: column, val: value }];
  const nullCond = [{ col: column, val: nullVal }];

  const query = `SELECT * FROM \`${tableName}\``;

  const queryWithCondition = `${query} WHERE \`type of food\` = 'mexican'`;
  const queryWithConditions = `${query} WHERE (\`type of food\` = 'mexican' OR \`best dish\` = 'burrito')`;
  const queryWithConditionAndLimit = `${query} WHERE \`type of food\` = 'mexican' LIMIT 100`;

  const tests: Array<{
    desc: string;
    expected: string;
    expectedNull: string;
    q?: string;
  }> = [
    {
      desc: "query no where clause",
      expected: `${query} WHERE ${condition}`,
      expectedNull: `${query} WHERE ${conditionNullVal}`,
    },
    {
      desc: "query with where clause",
      q: queryWithCondition,
      expected: `${queryWithCondition} AND ${condition}`,
      expectedNull: `${queryWithCondition} AND ${conditionNullVal}`,
    },
    {
      desc: "query with where clauses",
      q: queryWithConditions,
      expected: `${queryWithConditions} AND ${condition}`,
      expectedNull: `${queryWithConditions} AND ${conditionNullVal}`,
    },
    {
      desc: "query with where clause and limit",
      q: queryWithConditionAndLimit,
      expected: `${query} WHERE \`type of food\` = 'mexican' AND ${condition} LIMIT 100`,
      expectedNull: `${query} WHERE \`type of food\` = 'mexican' AND ${conditionNullVal} LIMIT 100`,
    },
  ];

  tests.forEach(test => {
    it(test.desc, () => {
      const { addWhereClauseToSelect } = renderUseSqlBuilder();
      expect(addWhereClauseToSelect(tableName, cond, test.q)).toBe(
        test.expected,
      );
    });
    it(`${test.desc}, null condition`, () => {
      const { addWhereClauseToSelect } = renderUseSqlBuilder();
      expect(addWhereClauseToSelect(tableName, nullCond, test.q)).toBe(
        test.expectedNull,
      );
    });
  });

  it("does not throw error", () => {
    const { addWhereClauseToSelect } = renderUseSqlBuilder();
    expect(() =>
      addWhereClauseToSelect(tableName, cond, td.invalidQuery),
    ).not.toThrow();
  });
});

describe("test addWhereClauseToSelect for cell buttons", () => {
  const refParams = {
    databaseName: "dbname",
    refName: "master",
  };
  const stringConds = [{ col: td.nameColumn.name, val: "test-string" }];
  const tests: Array<{
    desc: string;
    cols: Conditions;
    params: TableParams & { q?: string };
    expectedQuery: string;
  }> = [
    {
      desc: "no current query",
      cols: stringConds,
      params: { ...refParams, tableName: "test_table" },
      expectedQuery: "SELECT * FROM `test_table` WHERE `name` = 'test-string'",
    },
    {
      desc: "current query with columns",
      cols: stringConds,
      params: {
        ...refParams,
        tableName: "test_table",
        q: "SELECT id, name FROM test_table",
      },
      expectedQuery:
        "SELECT `id`, `name` FROM `test_table` WHERE `name` = 'test-string'",
    },
    {
      desc: "current query with where clause",
      cols: stringConds,
      params: {
        ...refParams,
        tableName: "test_table",
        q: "SELECT * FROM test_table WHERE id=1",
      },
      expectedQuery:
        "SELECT * FROM `test_table` WHERE `id` = 1 AND `name` = 'test-string'",
    },
    {
      desc: "no current query with single quote value",
      cols: [{ col: td.nameColumn.name, val: "McDonald's" }],
      params: { ...refParams, tableName: "test_table" },
      expectedQuery: "SELECT * FROM `test_table` WHERE `name` = 'McDonald\\'s'",
    },
    {
      desc: "current query with single quote value in where clause",
      cols: [{ col: td.idPKColumn.name, val: "2" }],
      params: {
        ...refParams,
        tableName: "test_table",
        q: "SELECT * FROM `test_table` WHERE `name` = 'McDonald\\'s'",
      },
      expectedQuery:
        "SELECT * FROM `test_table` WHERE `name` = 'McDonald\\'s' AND `id` = '2'",
    },
    {
      desc: "for foreign keys query",
      cols: td.fkColumns,
      params: {
        ...refParams,
        tableName: td.fkTableName,
      },
      expectedQuery: `SELECT * FROM \`${td.fkTableName}\` WHERE \`${td.fkColumns[0].col}\` = '${td.fkColumns[0].val}' AND \`${td.fkColumns[1].col}\` = '${td.fkColumns[1].val}'`,
    },
  ];

  tests.forEach(t => {
    it(t.desc, () => {
      const { addWhereClauseToSelect } = renderUseSqlBuilder();
      expect(
        addWhereClauseToSelect(t.params.tableName, t.cols, t.params.q),
      ).toEqual(t.expectedQuery);
    });
  });
});

describe("test convertToSqlWithOrderBy", () => {
  const column = "name";
  const type = "ASC";
  const query = "SELECT * FROM `lunch-places`";
  const queryOrderBy = `${query} ORDER BY \`rating\` ASC`;
  const queryOrderBySameCol = `${query} ORDER BY \`${column}\` DESC`;
  const queryOrderBySameColSameOrder = `${query} ORDER BY \`${column}\` DESC, \`rating\` ASC LIMIT 20`;

  const tests: Array<{
    desc: string;
    query: string;
    queryWithOrderBy: string;
    queryRemovedOrderBy?: string;
  }> = [
    {
      desc: "query no order by",
      query,
      queryWithOrderBy: `${query} ORDER BY \`${column}\` ${type}`,
    },
    {
      desc: "query with order by",
      query: queryOrderBy,
      queryWithOrderBy: `${queryOrderBy}, \`${column}\` ${type}`,
    },
    {
      desc: "query with order by same column",
      query: queryOrderBySameCol,
      queryWithOrderBy: `${query} ORDER BY \`${column}\` ${type}`,
      queryRemovedOrderBy: query,
    },
    {
      desc: "query with order by same column and same order",
      query: queryOrderBySameColSameOrder,
      queryWithOrderBy: `${query} ORDER BY \`${column}\` ${type}, \`rating\` ASC LIMIT 20`,
      queryRemovedOrderBy: `${query} ORDER BY \`rating\` ASC LIMIT 20`,
    },
  ];

  tests.forEach(test => {
    it(`${test.desc}, add order by`, () => {
      const { convertToSqlWithOrderBy } = renderUseSqlBuilder();
      expect(convertToSqlWithOrderBy(test.query, column, type)).toBe(
        test.queryWithOrderBy,
      );
    });

    it(`${test.desc}, remove order by`, () => {
      const { convertToSqlWithOrderBy } = renderUseSqlBuilder();
      expect(convertToSqlWithOrderBy(test.queryWithOrderBy, column)).toBe(
        test.queryRemovedOrderBy ?? test.query,
      );
    });
  });

  it("does not throw error", () => {
    const { convertToSqlWithOrderBy } = renderUseSqlBuilder();
    expect(() =>
      convertToSqlWithOrderBy(td.invalidQuery, column),
    ).not.toThrow();
  });
});

describe("test removeColumnFromQuery", () => {
  const tests: Array<{
    desc: string;
    query: string;
    colToRemove: string;
    cols: ColumnForDataTableFragment[];
    expected: string;
  }> = [
    {
      desc: "select query",
      query: "SELECT * FROM tablename",
      colToRemove: "name",
      cols: td.columns.slice(0, 2),
      expected: "SELECT `id` FROM `tablename`",
    },
    {
      desc: "select query with where clause",
      query: "SELECT id, name, age FROM tablename WHERE id=1",
      colToRemove: "id",
      cols: td.columns,
      expected: "SELECT `name`, `age` FROM `tablename` WHERE `id` = 1",
    },
    {
      desc: "select query with where not clause with double quoted single quote",
      query: `SELECT id, name, age FROM tablename WHERE NOT (id=1 AND name = "MCDONALD'S")`,
      colToRemove: "name",
      cols: td.columns,
      expected: `SELECT \`id\`, \`age\` FROM \`tablename\` WHERE NOT(\`id\` = 1 AND \`name\` = "MCDONALD\\'S")`,
    },
    {
      desc: "select query with where clause with escaped single quote",
      query: `SELECT * FROM tablename WHERE name = 'MCDONALD\\'S'`,
      colToRemove: "age",
      cols: td.columns,
      expected: `SELECT \`id\`, \`name\` FROM \`tablename\` WHERE \`name\` = 'MCDONALD\\'S'`,
    },
    {
      desc: "select query with where clause with two escaped single quotes",
      query: `SELECT * FROM tablename WHERE name = 'MCDONALD\\'S' OR name = 'Jinky\\'s Cafe'`,
      colToRemove: "age",
      cols: td.columns,
      expected: `SELECT \`id\`, \`name\` FROM \`tablename\` WHERE \`name\` = 'MCDONALD\\'S' OR \`name\` = 'Jinky\\'s Cafe'`,
    },
    {
      desc: "select query with join clause",
      query:
        "SELECT * FROM tablename, tablename2 where tablename.id = tablename2.id",
      colToRemove: "name",
      cols: td.joinedColumns,
      expected:
        "SELECT `tablename`.`id`, `tablename`.`age`, `tablename2`.`id` FROM `tablename`, `tablename2` WHERE `tablename`.`id` = `tablename2`.`id`",
    },
  ];

  tests.forEach(test => {
    it(test.desc, () => {
      const { removeColumnFromQuery } = renderUseSqlBuilder();
      expect(
        removeColumnFromQuery(test.query, test.colToRemove, test.cols),
      ).toEqual(test.expected);
    });
  });

  it("remove column doesn't throw error", () => {
    const { removeColumnFromQuery } = renderUseSqlBuilder();
    expect(() =>
      removeColumnFromQuery(td.invalidQuery, "age", td.columns.slice(0, 2)),
    ).not.toThrow();
  });
});

describe("test deleteFromTable", () => {
  const tests: Array<{
    desc: string;
    tableName: string;
    columns: ColumnForDataTableFragment[];
    row: RowForDataTableFragment;
    expectedQuery: string;
  }> = [
    {
      desc: "one pk",
      tableName: "test-table",
      columns: [td.idPKColumn, td.nameColumn],
      row: { columnValues: [td.idColValue, td.nameColValue] },
      expectedQuery: `DELETE FROM \`test-table\` WHERE \`id\` = '1'`,
    },
    {
      desc: "two pks",
      tableName: "test-table",
      columns: [td.idPKColumn, td.pkPKColumn, td.nameColumn],
      row: { columnValues: [td.idColValue, td.idTwoColValue, td.nameColValue] },
      expectedQuery: `DELETE FROM \`test-table\` WHERE \`id\` = '1' AND \`pk2\` = '2'`,
    },
    {
      desc: "three pks with single quote val",
      tableName: "test-table",
      columns: [
        td.idPKColumn,
        td.pkPKColumn,
        { ...td.nameColumn, isPrimaryKey: true },
      ],
      row: {
        columnValues: [
          td.idColValue,
          td.idTwoColValue,
          td.nameSingleQuoteColValue,
        ],
      },
      // TODO: Is this the right escaping?
      expectedQuery: `DELETE FROM \`test-table\` WHERE \`id\` = '1' AND \`pk2\` = '2' AND \`name\` = 'Taylor\\'s chair'`,
    },
  ];

  tests.forEach(t => {
    it(t.desc, () => {
      const { deleteFromTable } = renderUseSqlBuilder();
      expect(deleteFromTable(t.tableName, toPKCols(t.row, t.columns))).toEqual(
        t.expectedQuery,
      );
    });
  });
});

describe("test updateTableQuery", () => {
  const tests: Array<{
    desc: string;
    tableName: string;
    currentCol: string;
    newVal: string;
    columns: ColumnForDataTableFragment[];
    row: RowForDataTableFragment;
    expectedQuery: string;
  }> = [
    {
      desc: "one pk",
      tableName: "test-table",
      currentCol: "name",
      newVal: "New Name",
      columns: [td.idPKColumn, td.nameColumn],
      row: { columnValues: [td.idColValue, td.nameColValue] },
      expectedQuery: `UPDATE \`test-table\` SET \`name\` = 'New Name' WHERE \`id\` = '1'`,
    },
    {
      desc: "two pks",
      tableName: "test-table",
      currentCol: "name",
      newVal: "New Name",
      columns: [td.idPKColumn, td.pkPKColumn, td.nameColumn],
      row: { columnValues: [td.idColValue, td.idTwoColValue, td.nameColValue] },
      expectedQuery: `UPDATE \`test-table\` SET \`name\` = 'New Name' WHERE \`id\` = '1' AND \`pk2\` = '2'`,
    },
    {
      desc: "three pks with single quote val",
      tableName: "test-table",
      currentCol: "name",
      newVal: "New Name",
      columns: [
        td.idPKColumn,
        td.pkPKColumn,
        { ...td.nameColumn, isPrimaryKey: true },
      ],
      row: {
        columnValues: [
          td.idColValue,
          td.idTwoColValue,
          td.nameSingleQuoteColValue,
        ],
      },
      // TODO: Is this the right escaping?
      expectedQuery: `UPDATE \`test-table\` SET \`name\` = 'New Name' WHERE \`id\` = '1' AND \`pk2\` = '2' AND \`name\` = 'Taylor\\'s chair'`,
    },
  ];

  tests.forEach(test => {
    it(test.desc, () => {
      const { updateTableQuery } = renderUseSqlBuilder();
      expect(
        updateTableQuery(
          test.tableName,
          test.currentCol,
          test.newVal,
          toPKCols(test.row, test.columns),
        ),
      ).toEqual(test.expectedQuery);
    });
  });
});
