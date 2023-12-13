import { ColumnForDataTableFragment, ColumnValue } from "@gen/graphql-types";
import { Conditions } from "../util";

export const invalidQuery = `this is not a valid query`;

export const idPKColumn: ColumnForDataTableFragment = {
  name: "id",
  isPrimaryKey: true,
  type: "INT",
};

export const pkPKColumn: ColumnForDataTableFragment = {
  name: "pk2",
  isPrimaryKey: true,
  type: "INT",
};

export const nameColumn: ColumnForDataTableFragment = {
  name: "name",
  isPrimaryKey: false,
  type: "VARCHAR(16383)",
};

export const idColValue: ColumnValue = { displayValue: "1" };
export const idTwoColValue: ColumnValue = { displayValue: "2" };
export const nameColValue: ColumnValue = { displayValue: "Taylor" };
export const nameSingleQuoteColValue: ColumnValue = {
  displayValue: "Taylor's chair",
};

export const columns: ColumnForDataTableFragment[] = [
  {
    name: "id",
    constraints: [],
    isPrimaryKey: true,
    type: "VARCHAR(16383)",
    sourceTable: "tablename",
  },
  {
    name: "name",
    constraints: [],
    isPrimaryKey: true,
    type: "VARCHAR(16383)",
    sourceTable: "tablename",
  },
  {
    name: "age",
    constraints: [],
    isPrimaryKey: true,
    type: "VARCHAR(16383)",
    sourceTable: "tablename",
  },
];

export const joinedColumns: ColumnForDataTableFragment[] = [
  {
    name: "id",
    constraints: [],
    isPrimaryKey: true,
    type: "VARCHAR(16383)",
    sourceTable: "tablename",
  },
  {
    name: "name",
    constraints: [],
    isPrimaryKey: true,
    type: "VARCHAR(16383)",
    sourceTable: "tablename",
  },
  {
    name: "age",
    constraints: [],
    isPrimaryKey: true,
    type: "VARCHAR(16383)",
    sourceTable: "tablename",
  },
  {
    name: "id",
    constraints: [],
    isPrimaryKey: true,
    type: "VARCHAR(16383)",
    sourceTable: "tablename2",
  },
];

export const fkTableName = "fk_table";
export const fkColumns: Conditions = [
  {
    col: "col1",
    val: "fk1",
  },
  {
    col: "col2",
    val: "fk2",
  },
];
