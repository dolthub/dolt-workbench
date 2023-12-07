import { SortBranchesBy } from "../branches/branch.enum";
import { DoltSystemTable } from "../systemTables/systemTable.enums";
import { RawRows } from "./types";

// DATABASES

export const databasesQuery = `SHOW DATABASES`;

// Cannot use params here for the database revision. It will incorrectly
// escape refs with dots
export function useDBStatement(
  dbName?: string,
  refName?: string,
  isDolt = true,
): string {
  if (refName && isDolt) {
    return `USE \`${dbName}/${refName}\``;
  }
  return `USE \`${dbName}\``;
}

export const docsQuery = `SELECT * FROM dolt_docs`;

// TABLES

export const tableColsQuery = `SHOW FULL TABLES WHERE table_type = 'BASE TABLE'`;

export const getRowsQuery = (
  columns: RawRows,
): { q: string; cols: string[] } => {
  const cols = getPKColsForRowsQuery(columns);
  return {
    q: `SELECT * FROM ?? ${getOrderByFromCols(cols.length)}LIMIT ? OFFSET ?`,
    cols,
  };
};

export function getPKColsForRowsQuery(cs: RawRows): string[] {
  const pkCols = cs.filter(col => col.Key === "PRI");
  const cols = pkCols.map(c => c.Field);
  return cols;
}

// Creates ORDER BY statement with column parameters
// i.e. ORDER BY ::col1, ::col2
export function getOrderByFromCols(numCols: number): string {
  if (!numCols) return "";
  const pkCols = Array.from({ length: numCols })
    .map(() => `? ASC`)
    .join(", ");
  return pkCols === "" ? "" : `ORDER BY ${pkCols} `;
}

// SCHEMAS

export const getDoltSchemasQuery = (hasWhereCause = false): string =>
  `SELECT * FROM ${DoltSystemTable.SCHEMAS}${
    hasWhereCause ? " WHERE type = ?" : ""
  }`;

export const doltProceduresQuery = `SELECT * FROM ${DoltSystemTable.PROCEDURES}`;

export const getViewsQuery = `SELECT TABLE_SCHEMA, TABLE_NAME 
FROM information_schema.tables 
WHERE TABLE_TYPE = 'VIEW' AND TABLE_SCHEMA = ?`;

export const getTriggersQuery = `SHOW TRIGGERS`;

export const getEventsQuery = `SHOW EVENTS`;

export const getProceduresQuery = `SHOW PROCEDURE STATUS WHERE type = "PROCEDURE" AND db = ?`;

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
