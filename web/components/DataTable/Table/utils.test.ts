import {
  getDeleteRowQuery,
  getFilterByCellQuery,
} from "@components/CellButtons/queryHelpers";
import {
  ColumnForDataTableFragment,
  ColumnValue,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import { getUpdateCellQuery } from "@lib/dataTable";
import { TableParams } from "@lib/params";
import cx from "classnames";
import css from "./index.module.css";
import {
  getDiffTypeClassnameForCell,
  getDiffTypeClassnameForRow,
  getDiffTypeColumnIndex,
} from "./utils";

const idPKColumn: ColumnForDataTableFragment = {
  name: "id",
  isPrimaryKey: true,
  type: "INT",
};

const pkPKColumn: ColumnForDataTableFragment = {
  name: "pk2",
  isPrimaryKey: true,
  type: "INT",
};

const nameColumn: ColumnForDataTableFragment = {
  name: "name",
  isPrimaryKey: false,
  type: "VARCHAR(16383)",
};

const fromIdPKColumn: ColumnForDataTableFragment = {
  ...idPKColumn,
  name: "from_id",
};

const toIdPKColumn: ColumnForDataTableFragment = {
  ...idPKColumn,
  name: "to_id",
};

const diffTypeColumn: ColumnForDataTableFragment = {
  name: "diff_type",
  isPrimaryKey: false,
  type: "VARCHAR(16383)",
};

const idColValue: ColumnValue = { displayValue: "1" };
const idTwoColValue: ColumnValue = { displayValue: "2" };
const nameColValue: ColumnValue = { displayValue: "Taylor" };
const nameSingleQuoteColValue: ColumnValue = { displayValue: "Taylor's chair" };
const removedDiffTypeColValue: ColumnValue = { displayValue: "removed" };
const modifiedDiffTypeColValue: ColumnValue = { displayValue: "modified" };
const addedDiffTypeColValue: ColumnValue = { displayValue: "added" };

describe("tests getDiffTypeClassnameForRow", () => {
  const tests: Array<{
    desc: string;
    row: RowForDataTableFragment;
    cols: ColumnForDataTableFragment[];
    expectedClassName: string;
  }> = [
    {
      desc: "no `diff_type` column",
      row: { columnValues: [idColValue] },
      cols: [idPKColumn],
      expectedClassName: "",
    },
    {
      desc: "removed diff_type",
      row: { columnValues: [idColValue, removedDiffTypeColValue] },
      cols: [idPKColumn, diffTypeColumn],
      expectedClassName: cx(css.removed, css.removedRow),
    },
    {
      desc: "added diff_type",
      row: { columnValues: [idColValue, addedDiffTypeColValue] },
      cols: [idPKColumn, diffTypeColumn],
      expectedClassName: cx(css.added, css.addedRow),
    },
    {
      desc: "modified diff_type",
      row: { columnValues: [idColValue, modifiedDiffTypeColValue] },
      cols: [idPKColumn, diffTypeColumn],
      expectedClassName: "",
    },
  ];

  tests.forEach(test => {
    it(`tests getDiffTypeClassnameForRow for ${test.desc}`, () => {
      expect(getDiffTypeClassnameForRow(test.row, test.cols)).toEqual(
        test.expectedClassName,
      );
    });
  });
});

describe("tests getDiffTypeClassnameForCell", () => {
  const tests: Array<{
    desc: string;
    cols: ColumnForDataTableFragment[];
    row: RowForDataTableFragment;
    currCol: ColumnForDataTableFragment;
    expectedClassName: string;
  }> = [
    {
      desc: "no `diff_type` column",
      cols: [fromIdPKColumn, toIdPKColumn],
      row: { columnValues: [idColValue, idTwoColValue] },
      currCol: idPKColumn,
      expectedClassName: "",
    },
    {
      desc: "added diff_type",
      cols: [fromIdPKColumn, toIdPKColumn, diffTypeColumn],
      row: { columnValues: [idColValue, idColValue, addedDiffTypeColValue] },
      currCol: fromIdPKColumn,
      expectedClassName: "",
    },
    {
      desc: "current column is diff table meta column (i.e. `diff_type`)",
      cols: [fromIdPKColumn, toIdPKColumn, diffTypeColumn],
      row: {
        columnValues: [idColValue, idTwoColValue, modifiedDiffTypeColValue],
      },
      currCol: diffTypeColumn,
      expectedClassName: "",
    },
    {
      desc: "equal to_ and from_ column values",
      cols: [fromIdPKColumn, toIdPKColumn, diffTypeColumn],
      row: { columnValues: [idColValue, idColValue, modifiedDiffTypeColValue] },
      currCol: fromIdPKColumn,
      expectedClassName: "",
    },
    {
      desc: "nonequal to_ and from_ column values and current col is from_",
      cols: [fromIdPKColumn, toIdPKColumn, diffTypeColumn],
      row: {
        columnValues: [idColValue, idTwoColValue, modifiedDiffTypeColValue],
      },
      currCol: fromIdPKColumn,
      expectedClassName: css.removed,
    },
    {
      desc: "nonequal to_ and from_ column values and current col is to_",
      cols: [fromIdPKColumn, toIdPKColumn, diffTypeColumn],
      row: {
        columnValues: [idColValue, idTwoColValue, modifiedDiffTypeColValue],
      },
      currCol: toIdPKColumn,
      expectedClassName: css.added,
    },
  ];

  tests.forEach(test => {
    it(`tests getDiffTypeClassnameForCell for ${test.desc}`, () => {
      expect(
        getDiffTypeClassnameForCell(test.cols, test.row, test.currCol),
      ).toEqual(test.expectedClassName);
    });
  });
});

describe("tests getDiffTypeColumnIndex", () => {
  const tests: Array<{
    desc: string;
    cols: ColumnForDataTableFragment[];
    expectedIndex: number;
  }> = [
    { desc: "no diff_type column", cols: [idPKColumn], expectedIndex: -1 },
    {
      desc: "diff_type column zero index",
      cols: [diffTypeColumn],
      expectedIndex: 0,
    },
    {
      desc: "diff_type column first index",
      cols: [idPKColumn, diffTypeColumn],
      expectedIndex: 1,
    },
  ];

  tests.forEach(test => {
    it(`tests getDiffTypeColumnIndex for ${test.desc}`, () => {
      expect(getDiffTypeColumnIndex(test.cols)).toEqual(test.expectedIndex);
    });
  });
});

describe("test getUpdateCellQuery", () => {
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
      columns: [idPKColumn, nameColumn],
      row: { columnValues: [idColValue, nameColValue] },
      expectedQuery: `UPDATE \`test-table\` SET \`name\` = "New Name" WHERE \`id\` = "1"`,
    },
    {
      desc: "two pks",
      tableName: "test-table",
      currentCol: "name",
      newVal: "New Name",
      columns: [idPKColumn, pkPKColumn, nameColumn],
      row: { columnValues: [idColValue, idTwoColValue, nameColValue] },
      expectedQuery: `UPDATE \`test-table\` SET \`name\` = "New Name" WHERE \`id\` = "1" AND \`pk2\` = "2"`,
    },
    {
      desc: "three pks with single quote val",
      tableName: "test-table",
      currentCol: "name",
      newVal: "New Name",
      columns: [idPKColumn, pkPKColumn, { ...nameColumn, isPrimaryKey: true }],
      row: {
        columnValues: [idColValue, idTwoColValue, nameSingleQuoteColValue],
      },
      expectedQuery: `UPDATE \`test-table\` SET \`name\` = "New Name" WHERE \`id\` = "1" AND \`pk2\` = "2" AND \`name\` = "Taylor's chair"`,
    },
  ];

  tests.forEach(t => {
    it(`tests getUpdateCellQuery for ${t.desc}`, () => {
      expect(
        getUpdateCellQuery(
          t.tableName,
          t.currentCol,
          t.newVal,
          t.columns,
          t.row,
        ),
      ).toEqual(t.expectedQuery);
    });
  });
});

describe("test getDeleteRowQuery", () => {
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
      columns: [idPKColumn, nameColumn],
      row: { columnValues: [idColValue, nameColValue] },
      expectedQuery: `DELETE FROM \`test-table\` WHERE \`id\` = "1"`,
    },
    {
      desc: "two pks",
      tableName: "test-table",
      columns: [idPKColumn, pkPKColumn, nameColumn],
      row: { columnValues: [idColValue, idTwoColValue, nameColValue] },
      expectedQuery: `DELETE FROM \`test-table\` WHERE \`id\` = "1" AND \`pk2\` = "2"`,
    },
    {
      desc: "three pks with single quote val",
      tableName: "test-table",
      columns: [idPKColumn, pkPKColumn, { ...nameColumn, isPrimaryKey: true }],
      row: {
        columnValues: [idColValue, idTwoColValue, nameSingleQuoteColValue],
      },
      expectedQuery: `DELETE FROM \`test-table\` WHERE \`id\` = "1" AND \`pk2\` = "2" AND \`name\` = "Taylor's chair"`,
    },
  ];

  tests.forEach(t => {
    it(`tests getDeleteRowQuery for ${t.desc}`, () => {
      expect(getDeleteRowQuery(t.tableName, t.row, t.columns)).toEqual(
        t.expectedQuery,
      );
    });
  });
});

describe("test getFilterByCellQuery", () => {
  const refParams = {
    databaseName: "dbname",
    refName: "master",
  };
  const tests: Array<{
    desc: string;
    col: ColumnForDataTableFragment;
    value: string;
    params: TableParams & { q?: string };
    expectedQuery: string;
  }> = [
    {
      desc: "no current query",
      col: nameColumn,
      value: "test-string",
      params: { ...refParams, tableName: "test_table" },
      expectedQuery: "SELECT * FROM `test_table` WHERE `name` = 'test-string'",
    },
    {
      desc: "current query with columns",
      col: nameColumn,
      value: "test-string",
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
      col: nameColumn,
      value: "test-string",
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
      col: nameColumn,
      value: "McDonald's",
      params: { ...refParams, tableName: "test_table" },
      expectedQuery: "SELECT * FROM `test_table` WHERE `name` = 'McDonald\\'s'",
    },
    {
      desc: "current query with single quote value in where clause",
      col: idPKColumn,
      value: "2",
      params: {
        ...refParams,
        tableName: "test_table",
        q: "SELECT * FROM `test_table` WHERE `name` = 'McDonald\\'s'",
      },
      expectedQuery:
        "SELECT * FROM `test_table` WHERE `name` = 'McDonald\\'s' AND `id` = '2'",
    },
  ];

  tests.forEach(t => {
    it(`tests getFilterByCellQuery for ${t.desc}`, () => {
      expect(getFilterByCellQuery(t.col, t.value, t.params)).toEqual(
        t.expectedQuery,
      );
    });
  });
});
