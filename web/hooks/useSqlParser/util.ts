import { ColumnForDataTableFragment } from "@gen/graphql-types";
import { isNullValue } from "@lib/null";
import { ColumnRef, OrderBy, Select } from "node-sql-parser";

type Column = {
  expr: ColumnRef;
  as: string | null;
};

export type Columns = any[] | "*" | Column[];

// Uses regex to match table names in query "SELECT [columns] FROM [tableName] ..."
// does not work on more than 2 tables. but better than just extract 1 table
export function fallbackGetTableNamesForSelect(query: string): string[] {
  const tableNameRegex =
    /\b(?:from|join)\s+`?(\w+)`?(?:\s*(?:join|,)\s+`?(\w+)`?)*\b/gi;
  const matches = [...query.matchAll(tableNameRegex)];
  const tableNames = matches.flatMap(match => match.slice(1).filter(Boolean));
  return tableNames;
}

// Creates where object from conditions or adds conditions to existing where object
export function getWhereObj(column: string, value: string, parsed: Select) {
  const valIsNull = isNullValue(value);
  const escapedVal = escapeSingleQuotes(value);
  const newCondition = {
    type: "binary_expr",
    operator: valIsNull ? "IS" : "=",
    left: {
      type: "column_ref",
      table: null,
      column,
    },
    right: {
      type: valIsNull ? "null" : "string",
      value: valIsNull ? null : escapedVal,
    },
  };

  if (!parsed.where) {
    return newCondition;
  }

  return {
    type: "binary_expr",
    operator: "AND",
    left: { ...escapeSingleQuotesInWhereObj(parsed.where) },
    right: newCondition,
  };
}

// The where object is a binary tree with 'left' and 'right' nodes
export function escapeSingleQuotesInWhereObj(where: any): any {
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

function escapeSingleQuotes(value: string): string {
  if (value.includes("\\'")) return value;
  return value.replace(/'/g, "\\'");
}

export function mapColsToColumnNames(cols: string[]): Column[] {
  return cols.map(c => {
    return {
      expr: {
        type: "column_ref",
        table: null,
        column: c,
      },
      as: null,
    };
  });
}

export function mapColsToColumnRef(
  cols: ColumnForDataTableFragment[],
  isJoinClause: boolean,
): Column[] {
  return cols.map(c => {
    return {
      expr: {
        type: "column_ref",
        table: isJoinClause && c.sourceTable ? c.sourceTable : null,
        column: c.name,
      },
      as: null,
    };
  });
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

// Query should be wrapped in single quotes
// function makeQueryExecutable(q: string): string {
//   return (
//     q
//       // Escape single quotes
//       .replace(/'/g, "\\'")
//       // Remove newlines and carriage returns
//       .replace(/\r\n|\n|\r/gm, " ")
//       // Remove whitespace from beginning/end
//       .trim()
//   );
// }
