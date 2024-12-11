import { SortBranchesBy } from "../../branches/branch.enum";
import { RawRows } from "../types";

// TABLE

export const columnsQuery = `DESCRIBE ??`;

export const foreignKeysQuery = `SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE table_name=? AND table_schema=? 
AND referenced_table_schema IS NOT NULL`;

export const indexQuery = `SELECT 
  table_name, 
  index_name, 
  GROUP_CONCAT(comment) as COMMENTS, 
  GROUP_CONCAT(non_unique) AS NON_UNIQUES, 
  GROUP_CONCAT(column_name ORDER BY seq_in_index) AS COLUMNS 
FROM information_schema.statistics 
WHERE table_name=? AND index_name!="PRIMARY" 
GROUP BY index_name;`;

export const tableColsQuery = `SHOW FULL TABLES WHERE table_type = 'BASE TABLE'`;

// BRANCHES

export const callNewBranch = `CALL DOLT_BRANCH(?, ?)`;

export const callDeleteBranch = `CALL DOLT_BRANCH("-D", ?)`;

export function getOrderByColForBranches(
  sortBy?: SortBranchesBy,
): [string, "ASC" | "DESC"] {
  switch (sortBy) {
    case SortBranchesBy.LastUpdated:
      return ["latest_commit_date", "DESC"];
    default:
      return ["name", "ASC"];
  }
}

// COMMITS

export const doltLogsQuery = `SELECT * FROM DOLT_LOG(?, '--parents') LIMIT ? OFFSET ?`;

export const twoDotDoltLogsQuery = `SELECT * FROM DOLT_LOG(?, '--parents')`;

// DIFFS

export const hashOf = `SELECT HASHOF(?)`;
export const mergeBase = `SELECT DOLT_MERGE_BASE(?, ?)`;

export const getThreeDotDiffStatQuery = (hasTableName?: boolean): string =>
  `SELECT * FROM DOLT_DIFF_STAT(?${hasTableName ? `, ?` : ""})`;

export const getDiffStatQuery = (hasTableName?: boolean): string =>
  `SELECT * FROM DOLT_DIFF_STAT(?, ?${hasTableName ? `, ?` : ""})`;

export const getDiffSummaryQuery = (hasTableName?: boolean): string =>
  `SELECT * FROM DOLT_DIFF_SUMMARY(?, ?${hasTableName ? `, ?` : ""})`;

export const getThreeDotDiffSummaryQuery = (hasTableName?: boolean): string =>
  `SELECT * FROM DOLT_DIFF_SUMMARY(?${hasTableName ? `, ?` : ""})`;

export const schemaPatchQuery = `SELECT * FROM DOLT_PATCH(?, ?, ?) WHERE diff_type="schema"`;

export const threeDotSchemaPatchQuery = `SELECT * FROM DOLT_PATCH(?, ?) WHERE diff_type="schema"`;

export const schemaDiffQuery = `SELECT * FROM DOLT_SCHEMA_DIFF(?, ?, ?)`;

export const threeDotSchemaDiffQuery = `SELECT * FROM DOLT_SCHEMA_DIFF(?, ?)`;

// PULLS

export const getCallMerge = (hasAuthor = false) =>
  `CALL DOLT_MERGE(?, "--no-ff", "-m", ?${getAuthorNameString(hasAuthor)})`;

// REMOTES

export const callAddRemote = `CALL DOLT_REMOTE("add", ?, ?)`;

export const callDeleteRemote = `CALL DOLT_REMOTE("remove", ?)`;

export const callPullRemote = `CALL DOLT_PULL(?, ?)`;

export const callPushRemote = `CALL DOLT_PUSH(?, ?)`;

// TAGS

export const callDeleteTag = `CALL DOLT_TAG("-d", ?)`;

export const getCallNewTag = (hasMessage = false, hasAuthor = false) =>
  `CALL DOLT_TAG(?, ?${hasMessage ? `, "-m", ?` : ""}${getAuthorNameString(
    hasAuthor,
  )})`;

export function getAuthorNameString(hasAuthor: boolean): string {
  if (!hasAuthor) return "";
  return `, "--author", ?`;
}

// Creates ORDER BY statement with column parameters
// i.e. ORDER BY ::col1, ::col2
function getOrderByFromCols(numCols: number): string {
  if (!numCols) return "";
  const pkCols = Array.from({ length: numCols })
    .map(() => `? ASC`)
    .join(", ");
  return pkCols === "" ? "" : `ORDER BY ${pkCols} `;
}

export const getRowsQueryAsOf = (
  columns: RawRows,
): { q: string; cols: string[] } => {
  const cols = getPKColsForRowsQuery(columns);
  return {
    q: `SELECT * FROM ?? AS OF ? ${getOrderByFromCols(
      cols.length,
    )}LIMIT ? OFFSET ?`,
    cols,
  };
};

function getPKColsForRowsQuery(cs: RawRows): string[] {
  const pkCols = cs.filter(col => col.Key === "PRI");
  const cols = pkCols.map(c => c.Field);
  return cols;
}

export const tableColsQueryAsOf = `DESCRIBE ?? AS OF ?`;

export function getTableCommitDiffQuery(
  cols: RawRows,
  hasFilter = false,
): string {
  const whereDiffType = hasFilter ? ` WHERE diff_type=? ` : "";
  return `SELECT * FROM DOLT_DIFF(?, ?, ?)${whereDiffType}
  ${getOrderByFromDiffCols(cols)}
  LIMIT ?
  OFFSET ?`;
}

export function getOrderByFromDiffCols(cols: RawRows): string {
  const pkCols = cols.filter(col => col.Key === "PRI");
  const diffCols: string[] = [];
  pkCols.forEach(col => {
    diffCols.push(`to_${col.Field}`);
    diffCols.push(`from_${col.Field}`);
  });
  const orderBy = diffCols.map(c => `\`${c}\` ASC`).join(", ");
  return orderBy === "" ? "" : `ORDER BY ${orderBy} `;
}

export const callResetHard = `CALL DOLT_RESET("--hard")`;

export const callCheckoutTable = `CALL DOLT_CHECKOUT(?)`;
