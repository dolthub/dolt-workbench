import { SortBranchesBy } from "../../branches/branch.enum";
import { DoltSystemTable } from "../../systemTables/systemTable.enums";
import { getOrderByFromCols, getPKColsForRowsQuery } from "../mysql/queries";
import { RawRows } from "../types";

export const getDoltSchemasQuery = (hasWhereCause = false): string =>
  `SELECT * FROM ${DoltSystemTable.SCHEMAS}${
    hasWhereCause ? " WHERE type = ?" : ""
  }`;

export const doltProceduresQuery = `SELECT * FROM ${DoltSystemTable.PROCEDURES}`;

// BRANCHES

export const branchQuery = `SELECT * FROM dolt_branches WHERE name=?`;

export const getBranchesQuery = (sortBy?: SortBranchesBy) =>
  `SELECT * FROM dolt_branches ${getOrderByForBranches(sortBy)}`;

export const callNewBranch = `CALL DOLT_BRANCH(?, ?)`;

export const callDeleteBranch = `CALL DOLT_BRANCH("-D", ?)`;

function getOrderByForBranches(sortBy?: SortBranchesBy): string {
  switch (sortBy) {
    case SortBranchesBy.LastUpdated:
      return "ORDER BY latest_commit_date DESC ";
    default:
      return "";
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

// DOCS

export const docsQuery = `SELECT * FROM dolt_docs`;

// PULLS

export const callMerge = `CALL DOLT_MERGE(?, "--no-ff", "-m", ?)`;

// STATUS

export const statusQuery = `SELECT * FROM dolt_status`;

// TAGS

export const tagsQuery = `SELECT * FROM dolt_tags ORDER BY date DESC`;

export const tagQuery = `SELECT * FROM dolt_tags WHERE tag_name=?`;

export const callDeleteTag = `CALL DOLT_TAG("-d", ?)`;

export const getCallNewTag = (hasMessage = false, hasAuthor = false) =>
  `CALL DOLT_TAG(?, ?${hasMessage ? `, "-m", ?` : ""}${getAuthorNameString(
    hasAuthor,
  )})`;

export function getAuthorNameString(hasAuthor: boolean): string {
  if (!hasAuthor) return "";
  return `, "--author", ?`;
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
