import {
  ForeignKeysForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import { ReferencedColumn, getForeignKeyMap } from "./utils";

const row: RowForDataTableFragment = {
  columnValues: [{ displayValue: "4" }, { displayValue: "0" }],
};
const employeeIdFk: ForeignKeysForDataTableFragment = {
  tableName: "table",
  columnName: "employee_id",
  foreignKeyColumn: [{ referencedColumnName: "id", referrerColumnIndex: 0 }],
  referencedTableName: "employees",
};
const teamIdFk: ForeignKeysForDataTableFragment = {
  tableName: "table",
  columnName: "team_id",
  foreignKeyColumn: [{ referencedColumnName: "id", referrerColumnIndex: 0 }],
  referencedTableName: "teams",
};

const fkTests: Array<{
  desc: string;
  fks: ForeignKeysForDataTableFragment[] | undefined;
  cidx: number;
  colName: string;
  row: RowForDataTableFragment;
  expected: Record<string, ReferencedColumn[]>;
}> = [
  {
    fks: undefined,
    row,
    expected: {},
    cidx: 0,
    colName: "employee_id",
    desc: "undefined fks",
  },
  {
    fks: [employeeIdFk],
    row,
    expected: { employees: [{ columnName: "id", columnValue: "4" }] },
    cidx: 0,
    colName: "employee_id",
    desc: "one fk",
  },
  {
    fks: [employeeIdFk, teamIdFk],
    row,
    expected: { employees: [{ columnName: "id", columnValue: "4" }] },
    cidx: 0,
    colName: "employee_id",
    desc: "two fks, first column",
  },
  {
    fks: [employeeIdFk, teamIdFk],
    row,
    expected: { teams: [{ columnName: "id", columnValue: "0" }] },
    cidx: 1,
    colName: "team_id",
    desc: "two fks, second column",
  },
  {
    fks: [
      employeeIdFk,
      {
        tableName: "table",
        columnName: "employee_id",
        foreignKeyColumn: [
          { referencedColumnName: "id", referrerColumnIndex: 0 },
        ],
        referencedTableName: "employees_la",
      },
    ],
    row,
    expected: {
      employees: [{ columnName: "id", columnValue: "4" }],
      employees_la: [{ columnName: "id", columnValue: "4" }],
    },
    cidx: 0,
    colName: "employee_id",
    desc: "two fks, one column",
  },
];

describe("test foreign key utils", () => {
  fkTests.forEach(test => {
    it(test.desc, () => {
      expect(
        getForeignKeyMap(test.fks, test.row, test.cidx, test.colName),
      ).toEqual(test.expected);
    });
  });
});
