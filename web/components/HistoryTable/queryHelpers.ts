import useSqlBuilder from "@hooks/useSqlBuilder";
import useSqlParser from "@hooks/useSqlParser";
import { removeClauses } from "@lib/doltSystemTables";

// Takes dolt diff query that looks like "SELECT [columns] from dolt_(commit_)diff_[table] WHERE [conditions]"
// and returns dolt history query that looks like "SELECT [columns] from dolt_history_[table] WHERE [conditions]"
export function useGetDoltHistoryQuery(q: string): () => string {
  const { getTableName } = useSqlParser();
  const { convertToSqlWithNewColNames } = useSqlBuilder();
  const queryWithoutClauses = removeClauses(q);
  const queryCols = useGetCols(queryWithoutClauses);

  const generate = (): string => {
    // This is a workaround until all where clauses work
    const tableName = getTableName(queryWithoutClauses);
    if (!tableName) return "";

    const historyTableName = tableName.replace(
      /dolt_diff|dolt_commit_diff/,
      "dolt_history",
    );
    const cols = [...queryCols, "commit_hash", "committer", "commit_date"];

    // SELECT [cols] FROM dolt_history_[tableName] WHERE [conditions];
    const query = formatQuery(q);
    return convertToSqlWithNewColNames(query, cols, historyTableName);
  };

  return generate;
}

function formatQuery(q: string): string {
  const removedConditions = removeExtraWhereClause(removeCellsCondition(q));
  const removedPrefixes = removePrefixes(removedConditions);
  const [select, where, orderBy] = removedPrefixes.split(/where|order\sby/gi);
  const newWhere = removeDiffMetaColsFromWhereClause(where).trim();
  const whereClause = newWhere ? ` WHERE ${balanceParenthesis(newWhere)}` : "";
  const orderByClause = orderBy ? ` ORDER BY ${orderBy}` : "";
  return `${select}${whereClause}${orderByClause}`;
}

// Removes conditions from  where  clause where `commit` = "[hash]" or diff_type = "[type]"
function removeDiffMetaColsFromWhereClause(where: string): string {
  const removedClauses = where.replace(
    /(\s*`*(commit|diff_type)`*\s*=\s*["'`][^"'`]+["'`])+/gi,
    "",
  );
  return removeExtraAndsAndOrs(removedClauses);
}

// Removes extra AND or OR after removing conditions
function removeExtraAndsAndOrs(where: string): string {
  let lastWord = "";
  const filtered = where.split(" ").filter(s => {
    if (!s) return false;
    let keep = true;
    if (isAndOrOr(s) && (lastWord === "" || isAndOrOr(lastWord))) {
      keep = false;
    }
    lastWord = s;
    return keep;
  });
  if (isAndOrOr(lastWord)) {
    filtered.pop();
  }
  return filtered.join(" ");
}

function isAndOrOr(s: string): boolean {
  const lowered = s.toLowerCase();
  return lowered === "or" || lowered === "and";
}

// Remove all to_ and from_ prefixes from query string
function removePrefixes(q: string): string {
  const splitBySpace = q
    .split(" ")
    .map(word => removePrefix(word))
    .join(" ");
  const splitByOpenParen = splitBySpace
    .split("(")
    .map(word => removePrefix(word));
  return splitByOpenParen.join("(");
}

function removePrefix(word: string): string {
  // Remove "to_" and "from_" from words that look like both "`to_col_name`" and "to_col_name"
  return word.replace(/^`(to|from)_/gi, "`").replace(/^(to|from)_/gi, "");
}

// Removes AND (from_[col] <> to_[col] OR (from_[col] IS NOT NULL AND to_[col] IS NULL) OR ...) from query
function removeCellsCondition(q: string): string {
  // Represents "and (`word_with_underscores` <> `word_with_underscores`...)"
  const regex = /and\s\(`?[a-z0-9_\s]+`?\s?<>`?[a-z0-9_\s]+`?.+\)/gi;
  return q.replace(regex, "");
}

// Remove OR (from_[col] = [val]...) from query
function removeExtraWhereClause(q: string): string {
  const regex = /or\s\(*`?from_[a-z0-9_\s]`?.+\)?/gi;
  return q.replace(regex, "");
}

// Gets column names and removes "from_" and "to_" prefixes
function useGetCols(q: string): string[] {
  const { getColumns } = useSqlParser();
  const columns = getColumns(q);
  if (!columns?.length) return [];
  if (columns[0].expr.column === "*") return ["*"];
  // Remove dolt_commit_diff_[table] specific columns and column to_ and from_ prefixes
  const mappedCols = columns
    .slice(1, columns.length - 4)
    .map(c => c.expr.column.replace(/(to|from)_/gi, ""));
  // Remove any duplicate column names
  return mappedCols.filter((c, i) => mappedCols.indexOf(c) === i);
}

function balanceParenthesis(q: string): string {
  const open = "(";
  const closed = ")";
  let missedOpen = 0;
  let missedClosed = 0;

  for (let i = 0; i < q.length; i++) {
    if (q[i] === open) {
      missedClosed += 1;
    } else if (q[i] === closed) {
      if (missedClosed > 0) missedClosed -= 1;
      else missedOpen += 1;
    }
  }

  return `${open.repeat(missedOpen)} ${q} ${closed.repeat(missedClosed)}`;
}
