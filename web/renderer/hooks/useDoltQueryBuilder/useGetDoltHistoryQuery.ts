import { Maybe } from "@dolthub/web-utils";
import useSqlBuilder from "@hooks/useSqlBuilder";
import {
  Conditions,
  addToExistingWhereFromPKCols,
  getSqlFromTable,
  getSqlOrderBy,
  mapColsToColumnNames,
} from "@hooks/useSqlBuilder/util";
import useSqlParser from "@hooks/useSqlParser";
import { removeClauses } from "@lib/doltSystemTables";
import { Column, Expr, Select, Function as SqlFunction } from "node-sql-parser";
import { ReturnType } from "./types";

// Takes dolt diff query that looks like "SELECT [columns] from dolt_(commit_)diff_[table] WHERE [conditions]"
// and returns dolt history query that looks like "SELECT [columns] from dolt_history_[table] WHERE [conditions]"
export function useGetDoltHistoryQuery(
  connectionName: string,
  q: string,
): ReturnType {
  const { getTableName, parseSelectQuery } = useSqlParser(connectionName);
  const { convertToSqlSelect, isPostgres } = useSqlBuilder(connectionName);
  const queryWithoutClauses = removeClauses(q);

  const generate = (): string => {
    const parsed = parseSelectQuery(q);
    if (!parsed) return "";

    const tableName = getHistoryTableName(
      parsed,
      // This is a workaround until all where clauses work
      getTableName(queryWithoutClauses),
    );
    const columns = getHistoryColumns(parsed);
    const where = getHistoryWhereClause(parsed, isPostgres);

    return convertToSqlSelect({
      columns,
      from: getSqlFromTable(tableName),
      where,
      orderby: [getSqlOrderBy("commit_date", "DESC")],
    });
  };

  return { generateQuery: generate, isPostgres };
}

function getHistoryTableName(
  parsed: Select,
  backupTable: Maybe<string>,
): string {
  const tableName = parsed.from ? parsed.from[0].table : backupTable;
  if (!tableName) return "";
  return tableName.replace(/dolt_diff|dolt_commit_diff/, "dolt_history");
}

function getHistoryColumns(parsed: Select): Column[] {
  const convertedCols = convertDiffColsToHistoryCols(parsed.columns);
  const cols = [...convertedCols, "commit_hash", "committer", "commit_date"];
  return mapColsToColumnNames(cols);
}

function getHistoryWhereClause(
  parsed: Select,
  isPostgres: boolean,
): Expr | SqlFunction | null {
  const whereColVals = extractColumnValues(parsed.where);
  return addToExistingWhereFromPKCols(whereColVals, isPostgres);
}

function shouldAddColToConditions(col: string): boolean {
  const matchesDiffColumns =
    col.match(/(to|from)_commit/) || col === "diff_type";
  return !matchesDiffColumns && !col.startsWith("from_");
}

// Iterates `where` AST and extracts column names and values
function extractColumnValues(where: Expr | any): Conditions {
  const result: Conditions = [];

  function traverse(node?: Expr | any) {
    if (!node) return;
    if (node.type === "binary_expr" && node.operator === "=") {
      if (
        (node.left?.type === "column_ref" ||
          // TODO: Remove when https://github.com/taozhi8833998/node-sql-parser/issues/1941 is resolved
          node.left?.type === "double_quote_string") &&
        (node.right?.type === "double_quote_string" ||
          node.right.type === "single_quote_string")
      ) {
        const col = node.left.column || node.left.value;
        if (shouldAddColToConditions(col)) {
          result.push({ col: col.replace("to_", ""), val: node.right.value });
        }
      }
    }
    if (node.left) {
      traverse(node.left);
    }
    if (node.right) {
      traverse(node.right);
    }
  }

  traverse(where);
  return result;
}

// Removes "from_" and "to_" prefixes from columns
function convertDiffColsToHistoryCols(
  columns: any[] | Column[] | undefined,
): string[] {
  if (!columns?.length) return [];
  if (columns[0].expr.column === "*") return ["*"];
  // Remove dolt_commit_diff_[table] specific columns and column to_ and from_ prefixes
  const mappedCols = columns
    .slice(1, columns.length - 4)
    .map(c => c.expr.column.replace(/(to|from)_/gi, ""));
  // Remove any duplicate column names
  return mappedCols.filter((c, i) => mappedCols.indexOf(c) === i);
}
