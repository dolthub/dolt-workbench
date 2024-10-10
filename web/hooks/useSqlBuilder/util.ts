import { isNullValue } from "@dolthub/web-utils";
import { ColumnForDataTableFragment, SchemaType } from "@gen/graphql-types";
import {
  Alter,
  Column,
  ColumnRef,
  Delete,
  Dual,
  Expr,
  From,
  Insert_Replace,
  Limit,
  OrderBy,
  Function as ParserFunction,
  Select,
  Update,
} from "node-sql-parser";

export type Conditions = Array<{ col: string; val: string }>;
export type ColumnValue = { type: string; value: any };

export function getSqlColumnRef(
  column: string,
  table: string | null = null,
): ColumnRef {
  return { type: "column_ref", table, column };
}

export function getSqlColumn(
  column: string,
  table: string | null = null,
): Column {
  return { expr: getSqlColumnRef(column, table), as: "" };
}

export function getSqlOrderBy(col: string, type: "ASC" | "DESC"): OrderBy {
  return { expr: getSqlColumnRef(col), type };
}

export function getSqlTable(table: string): From | Dual {
  return { db: null, table, as: null };
}

export function getSqlFromTable(
  tableName: string | null,
): Array<From | Dual> | null {
  if (!tableName) return null;
  return [getSqlTable(tableName)];
}

export function getSqlLimit(limit: number): Limit {
  return { seperator: "", value: [{ type: "number", value: limit }] };
}

export function getSqlSelect(sel: Partial<Select>): Select {
  return {
    with: null,
    type: "select",
    options: null,
    distinct: null,
    columns: [getSqlColumn("*")],
    from: null,
    where: null,
    groupby: null,
    having: null,
    orderby: null,
    limit: null,
    ...sel,
  };
}

export function getSqlInsert(ins: Partial<Insert_Replace>): Insert_Replace {
  return {
    type: "insert",
    db: null,
    table: null,
    columns: null,
    values: [],
    ...ins,
  };
}

export function getSqlDelete(del: Partial<Delete>): Delete {
  return {
    type: "delete",
    from: [],
    table: null,
    where: null,
    ...del,
  };
}

export function getSqlAlter(alt: Partial<Alter>): Alter {
  return {
    type: "alter",
    table: [],
    expr: {},
    ...alt,
  };
}

export function getSqlUpdate(upd: Partial<Update>): Update {
  return {
    type: "update",
    db: null,
    table: [],
    set: [],
    where: null,
    ...upd,
  };
}

export function mapColsToColumnNames(cols: string[] | "*"): Column[] {
  if (cols === "*") return [getSqlColumn("*")];
  return cols.map(c => getSqlColumn(c));
}

export function mapColsToColumnRef(
  cols: ColumnForDataTableFragment[] | "*",
  isJoinClause: boolean,
): Column[] {
  if (cols === "*") return [getSqlColumn("*")];
  return cols.map(c =>
    getSqlColumn(c.name, isJoinClause ? c.sourceTable : null),
  );
}

// The where object is a binary tree with 'left' and 'right' nodes
export function escapeSingleQuotesInWhereObj(
  where: any | null,
  isPostgres: boolean,
): Expr | null {
  if (!where) return null;

  if (where.args) {
    escapeSingleQuotesInWhereObj(where.args, isPostgres);
  }

  if (where.expr) {
    escapeSingleQuotesInWhereObj(where.expr, isPostgres);
  }

  if (where.left) {
    escapeSingleQuotesInWhereObj(where.left, isPostgres);
  }

  if (where.value) {
    if (typeof where.value === "string") {
      // eslint-disable-next-line no-param-reassign
      where.value = escapeSingleQuotes(where.value, isPostgres);
    }
    if (Array.isArray(where.value)) {
      where.value.forEach((val: any) =>
        escapeSingleQuotesInWhereObj(val, isPostgres),
      );
    }
  }

  if (where.right) {
    escapeSingleQuotesInWhereObj(where.right, isPostgres);
  }

  return where;
}

export function escapeSingleQuotes(value: string, isPostgres: boolean): string {
  if (isPostgres) {
    if (value.includes("''")) return value;
    return value.replace(/'/g, "''");
  }
  if (value.includes("\\'")) return value;
  return value.replace(/'/g, "\\'");
}

function getExprFunction(name: string, vals: string[]): ParserFunction | any {
  return {
    type: "function",
    name,
    args: {
      type: "expr_list",
      value: vals.map(v => {
        return {
          type: "single_quote_string",
          value: v,
        };
      }),
    },
  };
}

export function getNewWhereFunctionCondition(
  column: string,
  fnName: string,
  vals: string[],
): Expr {
  return {
    type: "binary_expr",
    operator: "=",
    left: getSqlColumnRef(column),
    right: getExprFunction(fnName, vals),
  };
}

function getNewWhereCondition(
  column: string,
  value: string,
  isPostgres: boolean,
): Expr {
  const valIsNull = isNullValue(value);
  const escapedVal = escapeSingleQuotes(value, isPostgres);
  return {
    type: "binary_expr",
    operator: valIsNull ? "IS" : "=",
    left: getSqlColumnRef(column),
    right: {
      type: valIsNull ? "null" : "string",
      value: valIsNull ? null : escapedVal,
    },
  };
}

// Creates where object from conditions or adds conditions to existing where object
export function getWhereObj(
  column: string,
  value: string,
  where: Expr | ParserFunction | null,
  isPostgres: boolean,
): Expr {
  const newCondition = getNewWhereCondition(column, value, isPostgres);

  if (!where) {
    return newCondition;
  }

  const left = escapeSingleQuotesInWhereObj(where, isPostgres);
  if (!left) {
    return newCondition;
  }

  return {
    type: "binary_expr",
    operator: "AND",
    left,
    right: newCondition,
  };
}

export function getOrderByArr(
  parsed: Select,
  column: string,
  type?: "ASC" | "DESC",
): OrderBy[] | null {
  // If default, remove order by clause for column
  if (!type) {
    return parsed.orderby
      ? parsed.orderby.filter(
          o => o.expr.column !== column && o.expr.value !== column,
        )
      : null;
  }
  // If order by clause for column exists, update type
  const colInOrderBy = parsed.orderby?.find(
    o => o.expr.column === column || o.expr.value === column,
  );
  if (colInOrderBy) {
    colInOrderBy.type = type;
    return parsed.orderby;
  }
  // Otherwise, add new order by clause
  const newOrderby = getSqlOrderBy(column, type);
  return parsed.orderby ? [...parsed.orderby, newOrderby] : [newOrderby];
}

export function getWhereAndFromConditions(
  conditions: Conditions,
  isPostgres: boolean,
): Expr | null {
  let cond: Expr | null = null;
  conditions.forEach(c => {
    cond = getWhereObj(c.col, c.val, cond, isPostgres);
  });
  return cond;
}

export function addToExistingWhereFromPKCols(
  conditions: Conditions,
  isPostgres: boolean,
  where?: Expr | ParserFunction | null,
): Expr | ParserFunction | null {
  let cond: Expr | ParserFunction | null = where || null;
  conditions.forEach(c => {
    cond = getWhereObj(c.col, c.val, cond, isPostgres);
  });
  return cond;
}

export function getPostgresSchemaDefQuery(
  name: string,
  kind: SchemaType,
  schemaName?: string,
): string {
  switch (kind) {
    case SchemaType.Table:
      return `SELECT ordinal_position, column_name, udt_name as data_type, is_nullable, column_default FROM information_schema.columns WHERE${schemaName ? ` table_schema = '${schemaName}' AND` : ""} table_name = '${name}'`;
    case SchemaType.View:
      return `SELECT pg_get_viewdef('${schemaName ?? "public"}.${name}'::regclass, true)`;
    case SchemaType.Trigger:
      return `SELECT pg_get_triggerdef(oid) FROM pg_trigger where tgname = '${name}'`;
    case SchemaType.Event:
      return `SELECT * FROM pg_event_trigger WHERE evtname = '${name}'`;
    case SchemaType.Procedure:
      return `SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = '${name}'`;
    default:
      return "";
  }
}
