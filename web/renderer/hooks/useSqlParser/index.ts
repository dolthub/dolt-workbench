import { Maybe } from "@dolthub/web-utils";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import { AST, Column, Parser, Select } from "node-sql-parser";
import { fallbackGetTableNamesForSelect } from "./util";

const parser = new Parser();

function getQueryError(q: string, err: unknown): string {
  return `query: ${q}\nerror: ${err}`;
}

export default function useSqlParser(connectionName: string) {
  const { isPostgres, loading } = useDatabaseDetails(connectionName);

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
    // return obj;
    return obj.type === "select" ? obj : null;
  }

  // Gets table names as array `{type}::{dbName}::{tableName}` and converts to array of tableNames
  function getTableNames(q: string): string[] | undefined {
    try {
      const tl = parser.tableList(q, opt);
      return tl.map(tn => {
        const [, schemaName, tableName] = tn.split("::");
        if (isPostgres && schemaName !== "null") {
          return `${schemaName}.${tableName}`;
        }
        return tableName;
      });
    } catch (err) {
      console.error(getQueryError(q, err));
      return undefined;
    }
  }

  function requireTableNamesForSelect(q: string): string[] {
    const tns = getTableNames(q);
    return tns ?? fallbackGetTableNamesForSelect(q, isPostgres);
  }

  // Extracts tableName from query
  function getTableName(q?: string): Maybe<string> {
    if (!q) return undefined;
    const tns = getTableNames(q);
    if (!tns || tns.length === 0) return undefined;
    return tns[0];
  }

  // Extracts columns from query string
  function getColumns(q: string): any[] | Column[] | undefined {
    const ast = parseSelectQuery(q);
    return ast?.columns;
  }

  function sqlify(ast: AST[] | AST): string {
    return parser.sqlify(ast, opt);
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
      return !parsed.orderby.some(
        o => o.expr.column === column || o.expr.value === column,
      );
    }
    // Check if column and type match
    return parsed.orderby.some(
      o =>
        (o.expr.column === column || o.expr.value === column) &&
        o.type === type,
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

  function isMultipleQueries(queryString: string): boolean {
    try {
      const { ast } = parser.parse(queryString);
      return Array.isArray(ast) && ast.length > 1;
    } catch (err) {
      return false;
    }
  }

  return {
    getColumns,
    getQueryType,
    getTableName,
    getTableNames,
    isMultipleQueries,
    isMutation,
    isPostgres,
    parseSelectQuery,
    queryHasOrderBy,
    requireTableNamesForSelect,
    sqlify,
    loading,
  };
}
