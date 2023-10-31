import { ColumnForDataTableFragment } from "@gen/graphql-types";
import Maybe from "@lib/Maybe";
import { AST, ColumnRef, OrderBy, Parser, Select } from "node-sql-parser";
import { isNullValue } from "../null";

const parser = new Parser();
const opt = {
  database: "MYSQL",
};

function getQueryError(q: string, err: unknown): string {
  return `query: ${q}\nerror: ${err}`;
}

export function parseSelectQuery(q: string): Select | null {
  let ast = {};
  try {
    ast = parser.astify(q, opt);
  } catch (err) {
    console.error(getQueryError(q, err));
  }
  const obj: AST = Array.isArray(ast) ? ast[0] : ast;
  return obj.type === "select" ? obj : null;
}

// Gets table names as array `{type}::{dbName}::{tableName}` and converts to array of tableNames
export function getTableNames(q: string): string[] | undefined {
  try {
    return parser.tableList(q, opt).map(tn => tn.split("::")[2]);
  } catch (err) {
    console.error(getQueryError(q, err));
    return undefined;
  }
}

export function tryTableNameForSelect(q: string): Maybe<string> {
  return getTableName(q) ?? fallbackGetTableNamesForSelect(q)[0];
}

export function requireTableNamesForSelect(q: string): string[] {
  return getTableNames(q) ?? fallbackGetTableNamesForSelect(q);
}

// Extracts tableName from query
export function getTableName(q?: string): Maybe<string> {
  if (!q) return undefined;
  const tns = getTableNames(q);
  if (!tns || tns.length === 0) return undefined;
  return tns[0];
}

// Uses regex to match table names in query "SELECT [columns] FROM [tableName] ..."
// does not work on more than 2 tables. but better than just extract 1 table
export function fallbackGetTableNamesForSelect(query: string): string[] {
  const tableNameRegex =
    /\b(?:from|join)\s+`?(\w+)`?(?:\s*(?:join|,)\s+`?(\w+)`?)*\b/gi;
  const matches = [...query.matchAll(tableNameRegex)];
  const tableNames = matches.flatMap(match => match.slice(1).filter(Boolean));
  return tableNames;
}

type Column = {
  expr: ColumnRef;
  as: string | null;
};

type Columns = any[] | "*" | Column[];

// Extracts columns from query string
export function getColumns(q: string): Columns | undefined {
  const ast = parseSelectQuery(q);
  return ast?.columns;
}

function mapColsToColumnNames(cols: string[]): Column[] {
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

function mapColsToColumnRef(
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

export function convertToSql(select: Select): string {
  return parser.sqlify(select, opt);
}

// Converts query string to sql with new table name and columns
export function convertToSqlWithNewColNames(
  q: string,
  cols: string[] | "*",
  tableName: string,
): string {
  const ast = parseSelectQuery(q);
  const columns = cols === "*" ? cols : mapColsToColumnNames(cols);
  if (!ast) return "";
  const newAst: Select = {
    ...ast,
    columns,
    from: [{ db: null, table: tableName, as: null }],
    where: escapeSingleQuotesInWhereObj(ast.where),
  };
  return convertToSql(newAst);
}

// Converts query string to sql with new table name and columns
export function convertToSqlWithNewCols(
  q: string,
  cols: ColumnForDataTableFragment[] | "*",
  tableNames?: string[],
): string {
  const ast = parseSelectQuery(q);
  const isJoinClause = tableNames && tableNames.length > 1;
  const columns =
    cols === "*" ? cols : mapColsToColumnRef(cols, !!isJoinClause);

  if (!ast) return "";
  if (!tableNames || tableNames.length === 0) {
    return convertToSql({
      ...ast,
      columns,
      from: [{ db: null, table: null, as: null }],
      where: escapeSingleQuotesInWhereObj(ast.where),
    });
  }
  const newAst: Select = {
    ...ast,
    columns,
    from: tableNames.map(table => {
      return { db: null, table, as: null };
    }),
    where: escapeSingleQuotesInWhereObj(ast.where),
  };
  return convertToSql(newAst);
}

// Adds condition to query string
export function convertToSqlWithNewCondition(
  query: string,
  column: string,
  value: string,
): string {
  const parsed = parseSelectQuery(query);
  if (!parsed) {
    return query;
  }
  const where = getWhereObj(column, value, parsed);
  return convertToSql({
    ...parsed,
    where,
  });
}

// Adds order by clause to query string
export function convertToSqlWithOrderBy(
  query: string,
  column: string,
  type?: "ASC" | "DESC",
): string {
  const parsed = parseSelectQuery(query);
  if (!parsed) {
    return query;
  }
  const orderby = getOrderByArr(parsed, column, type);
  return convertToSql({ ...parsed, orderby });
}

// Check if query has order by clause for column and type
export function queryHasOrderBy(
  query: string,
  column: string,
  type?: "ASC" | "DESC",
): boolean {
  const parsed = parseSelectQuery(query);
  if (!parsed) {
    return false;
  }
  // If no order by, return true for default and false otherwise
  if (!parsed.orderby) {
    return !type;
  }
  // If default, check if order by for column exists
  if (!type) {
    return !parsed.orderby.some(o => o.expr.column === column);
  }
  // Check if column and type match
  return parsed.orderby.some(o => o.expr.column === column && o.type === type);
}

// Creates where object from conditions or adds conditions to existing where object
function getWhereObj(column: string, value: string, parsed: Select) {
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
function escapeSingleQuotesInWhereObj(where: any): any {
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

function getOrderByArr(
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

// Gets the type of query
export function getQueryType(q: string): string | undefined {
  let ast = {};
  try {
    ast = parser.astify(q, opt);
  } catch (err) {
    console.error(getQueryError(q, err));
    return undefined;
  }
  const obj: AST | undefined = Array.isArray(ast) ? ast[0] : ast;
  if (!obj) return undefined;
  return obj.type;
}

export function isMutation(q?: string): boolean {
  if (!q) return false;
  const type = getQueryType(q);
  if (!type) {
    const lower = q.toLowerCase();
    if (
      lower.startsWith("insert") ||
      lower.startsWith("alter") ||
      lower.startsWith("create") ||
      lower.startsWith("drop") ||
      lower.startsWith("update") ||
      lower.startsWith("revoke") ||
      lower.startsWith("grant") ||
      lower.startsWith("flush") ||
      lower.startsWith("replace") ||
      (lower.startsWith("with") &&
        ((lower.includes("update") && lower.includes("set")) ||
          lower.includes("delete from")))
    ) {
      return true;
    }
  }
  return !!type && type !== "select" && type !== "desc" && type !== "show";
}

// Removes a column from a select query
export function removeColumnFromQuery(
  q: string,
  colNameToRemove: string,
  cols: ColumnForDataTableFragment[],
): string {
  const newCols = cols.filter(c => c.name !== colNameToRemove);
  const tableName = getTableNames(q);
  return convertToSqlWithNewCols(q, newCols, tableName);
}

function escapeSingleQuotes(value: string): string {
  if (value.includes("\\'")) return value;
  return value.replace(/'/g, "\\'");
}

// Query should be wrapped in single quotes
export function makeQueryExecutable(q: string): string {
  return (
    q
      // Escape single quotes
      .replace(/'/g, "\\'")
      // Remove newlines and carriage returns
      .replace(/\r\n|\n|\r/gm, " ")
      // Remove whitespace from beginning/end
      .trim()
  );
}

export function isMultipleQueries(queryString: string): boolean {
  try {
    const { ast } = parser.parse(queryString);
    return Array.isArray(ast) && ast.length > 1;
  } catch (err) {
    return false;
  }
}
