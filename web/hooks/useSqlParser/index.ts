import { ColumnForDataTableFragment } from "@gen/graphql-types";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import Maybe from "@lib/Maybe";
import { AST, Parser, Select } from "node-sql-parser";
import {
  Columns,
  escapeSingleQuotesInWhereObj,
  fallbackGetTableNamesForSelect,
  getOrderByArr,
  getWhereObj,
  mapColsToColumnNames,
  mapColsToColumnRef,
} from "./util";

const parser = new Parser();

function getQueryError(q: string, err: unknown): string {
  return `query: ${q}\nerror: ${err}`;
}

export default function useSqlParser() {
  const { isPostgres } = useDatabaseDetails();

  const opt = {
    database: isPostgres ? "POSTGRESQL" : "MYSQL",
  };

  function parseSelectQuery(q: string): Select | null {
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
  function getTableNames(q: string): string[] | undefined {
    try {
      return parser.tableList(q, opt).map(tn => tn.split("::")[2]);
    } catch (err) {
      console.error(getQueryError(q, err));
      return undefined;
    }
  }

  function requireTableNamesForSelect(q: string): string[] {
    return getTableNames(q) ?? fallbackGetTableNamesForSelect(q);
  }

  // Extracts tableName from query
  function getTableName(q?: string): Maybe<string> {
    if (!q) return undefined;
    const tns = getTableNames(q);
    if (!tns || tns.length === 0) return undefined;
    return tns[0];
  }

  // Extracts columns from query string
  function getColumns(q: string): Columns | undefined {
    const ast = parseSelectQuery(q);
    return ast?.columns;
  }

  function convertToSql(select: Select): string {
    return parser.sqlify(select, opt);
  }

  // Converts query string to sql with new table name and columns
  function convertToSqlWithNewColNames(
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
  function convertToSqlWithNewCols(
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
  function convertToSqlWithNewCondition(
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
  function convertToSqlWithOrderBy(
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
  function queryHasOrderBy(
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
    return parsed.orderby.some(
      o => o.expr.column === column && o.type === type,
    );
  }

  // Gets the type of query
  function getQueryType(q: string): string | undefined {
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

  function isMutation(q?: string): boolean {
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
  function removeColumnFromQuery(
    q: string,
    colNameToRemove: string,
    cols: ColumnForDataTableFragment[],
  ): string {
    const newCols = cols.filter(c => c.name !== colNameToRemove);
    const tableName = getTableNames(q);
    return convertToSqlWithNewCols(q, newCols, tableName);
  }

  function isMultipleQueries(queryString: string): boolean {
    try {
      const { ast } = parser.parse(queryString);
      return Array.isArray(ast) && ast.length > 1;
    } catch (err) {
      return false;
    }
  }

  return {
    convertToSqlWithNewColNames,
    convertToSqlWithNewCols,
    convertToSqlWithNewCondition,
    convertToSqlWithOrderBy,
    getColumns,
    getQueryType,
    getTableName,
    isMultipleQueries,
    isMutation,
    parseSelectQuery,
    queryHasOrderBy,
    removeColumnFromQuery,
    requireTableNamesForSelect,
  };
}
