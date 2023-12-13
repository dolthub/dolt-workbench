import { ColumnForDataTableFragment } from "@gen/graphql-types";
import { isNullValue } from "@lib/null";
import {
  Alter,
  Column,
  Delete,
  Expr,
  Insert_Replace,
  OrderBy,
  Select,
  Update,
} from "node-sql-parser";

export type Conditions = Array<{ col: string; val: string }>;

export function getSqlColumn(column: string): Column {
  return { expr: { column, type: "column_ref", table: null }, as: "" };
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
    table: { db: null, table: "", as: null },
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
    where: {},
    ...upd,
  };
}

export function mapColsToColumnNames(cols: string[] | "*"): Column[] {
  if (cols === "*") return [getSqlColumn("*")];
  return cols.map(c => {
    return {
      expr: {
        type: "column_ref",
        table: null,
        column: c,
      },
      as: "",
    };
  });
}

export function mapColsToColumnRef(
  cols: ColumnForDataTableFragment[] | "*",
  isJoinClause: boolean,
): Column[] {
  if (cols === "*") return [getSqlColumn("*")];
  return cols.map(c => {
    return {
      expr: {
        type: "column_ref",
        table: isJoinClause && c.sourceTable ? c.sourceTable : null,
        column: c.name,
      },
      as: "",
    };
  });
}

// The where object is a binary tree with 'left' and 'right' nodes
export function escapeSingleQuotesInWhereObj(where: any | null): any | null {
  if (!where) return null;

  if (where.args) {
    escapeSingleQuotesInWhereObj(where.args);
  }

  if (where.expr) {
    escapeSingleQuotesInWhereObj(where.expr);
  }

  if (where.left) {
    escapeSingleQuotesInWhereObj(where.left);
  }

  if (where.value) {
    if (typeof where.value === "string") {
      // eslint-disable-next-line no-param-reassign
      where.value = escapeSingleQuotes(where.value);
    }
    if (Array.isArray(where.value)) {
      where.value.forEach((val: any) => escapeSingleQuotesInWhereObj(val));
    }
  }

  if (where.right) {
    escapeSingleQuotesInWhereObj(where.right);
  }

  return where;
}

export function escapeSingleQuotes(value: string): string {
  if (value.includes("\\'")) return value;
  return value.replace(/'/g, "\\'");
}

function getNewWhereCondition(column: string, value: string): Expr {
  const valIsNull = isNullValue(value);
  const escapedVal = escapeSingleQuotes(value);
  return {
    type: "binary_expr",
    operator: valIsNull ? "IS" : "=",
    left: {
      type: "column_ref",
      table: null,
      column,
    },
    right: {
      // type: "param",
      // value: escapedVal,
      type: valIsNull ? "null" : "string",
      value: valIsNull ? null : escapedVal,
    },
  };
}

// Creates where object from conditions or adds conditions to existing where object
export function getWhereObj(
  column: string,
  value: string,
  where: any | null,
): Expr {
  const newCondition = getNewWhereCondition(column, value);

  if (!where) {
    return newCondition;
  }

  return {
    type: "binary_expr",
    operator: "AND",
    left: { ...escapeSingleQuotesInWhereObj(where) },
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
      ? parsed.orderby.filter(o => o.expr.column !== column)
      : null;
  }
  // If order by clause for column exists, update type
  const colInOrderBy = parsed.orderby?.find(o => o.expr.column === column);
  if (colInOrderBy) {
    colInOrderBy.type = type;
    return parsed.orderby;
  }
  // Otherwise, add new order by clause
  const newOrderby = {
    expr: { type: "column_ref", column },
    type,
  };
  return parsed.orderby ? [...parsed.orderby, newOrderby] : [newOrderby];
}

export function getWhereFromPKCols(
  conditions: Conditions,
  where?: any | null,
): Expr {
  let cond: any | null = where || null;
  conditions.forEach(c => {
    cond = getWhereObj(c.col, c.val, cond);
  });
  return cond;
}
