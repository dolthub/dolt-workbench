import {
  ColumnForDataTableFragment,
  ColumnValue,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import cx from "classnames";
import css from "./index.module.css";
import {
  getDiffTypeClassnameForCell,
  getDiffTypeClassNameForDiffTableRow,
  getDiffTypeColumnIndex,
} from "./utils";

const idPKColumn: ColumnForDataTableFragment = {
  name: "id",
  isPrimaryKey: true,
  type: "INT",
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
      expect(getDiffTypeClassNameForDiffTableRow(test.row, test.cols)).toEqual(
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
