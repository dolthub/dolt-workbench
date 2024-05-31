import { RawRows } from "../types";

// TABLE

// TODO: Table queries
// export const columnsQuery = `DESCRIBE ??`;

// export const foreignKeysQuery = `SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
// WHERE table_name=? AND table_schema=?
// AND referenced_table_schema IS NOT NULL`;

// export const indexQuery = `SELECT
//   table_name,
//   index_name,
//   GROUP_CONCAT(comment) as COMMENTS,
//   GROUP_CONCAT(non_unique) AS NON_UNIQUES,
//   GROUP_CONCAT(column_name ORDER BY seq_in_index) AS COLUMNS
// FROM information_schema.statistics
// WHERE table_name=? AND index_name!="PRIMARY"
// GROUP BY index_name;`;

// export const tableColsQuery = `SHOW FULL TABLES WHERE table_type = 'BASE TABLE'`;

// BRANCHES

export const callNewBranch = `CALL DOLT_BRANCH($1, $2)`;

export const callDeleteBranch = `CALL DOLT_BRANCH('-D', $1)`;

// COMMITS

export const doltLogsQuery = `SELECT * FROM DOLT_LOG($1, '--parents') LIMIT $2 OFFSET $3`;

export const twoDotDoltLogsQuery = `SELECT * FROM DOLT_LOG($1, '--parents')`;

// DIFFS

export const hashOf = `SELECT HASHOF($1)`;
export const mergeBase = `SELECT DOLT_MERGE_BASE($1, $2)`;

export const getThreeDotDiffStatQuery = (hasTableName?: boolean): string =>
  `SELECT * FROM DOLT_DIFF_STAT($1${hasTableName ? `, $2` : ""})`;

export const getDiffStatQuery = (hasTableName?: boolean): string =>
  `SELECT * FROM DOLT_DIFF_STAT($1, $2${hasTableName ? `, $3` : ""})`;

export const getDiffSummaryQuery = (hasTableName?: boolean): string =>
  `SELECT * FROM DOLT_DIFF_SUMMARY($1, $2${hasTableName ? `, $3` : ""})`;

export const getThreeDotDiffSummaryQuery = (hasTableName?: boolean): string =>
  `SELECT * FROM DOLT_DIFF_SUMMARY($1${hasTableName ? `, $2` : ""})`;

export const schemaPatchQuery = `SELECT * FROM DOLT_PATCH($1, $2, $3) WHERE diff_type='schema'`;

export const threeDotSchemaPatchQuery = `SELECT * FROM DOLT_PATCH($1, $2) WHERE diff_type='schema'`;

export const schemaDiffQuery = `SELECT * FROM DOLT_SCHEMA_DIFF($1, $2, $3)`;

export const threeDotSchemaDiffQuery = `SELECT * FROM DOLT_SCHEMA_DIFF($1, $2)`;

// PULLS

export const getCallMerge = (hasAuthor = false) =>
  `CALL DOLT_MERGE($1, '--no-ff', '-m', $2${getAuthorNameString(hasAuthor, 3)})`;

// TAGS

export const callDeleteTag = `CALL DOLT_TAG('-d', $1)`;

export const getCallNewTag = (hasMessage = false, hasAuthor = false) =>
  `CALL DOLT_TAG($1, $2${hasMessage ? `, '-m', $3` : ""}${getAuthorNameString(
    hasAuthor,
    hasMessage ? 4 : 3,
  )})`;

function getAuthorNameString(hasAuthor: boolean, n: number): string {
  if (!hasAuthor) return "";
  return `, '--author', $${n}`;
}

// TODO: Columns
// Creates ORDER BY statement with column parameters
// i.e. ORDER BY ::col1, ::col2
function getOrderByFromCols(numCols: number): string {
  if (!numCols) return "";
  const pkCols = Array.from({ length: numCols })
    .map((_, i) => `$${i + 2} ASC`)
    .join(", ");
  return pkCols === "" ? "" : `ORDER BY ${pkCols} `;
}

// TODO: Table name
export const getRowsQueryAsOf = (
  columns: RawRows,
  tableName: string,
): { q: string; cols: string[] } => {
  const cols = getPKColsForRowsQuery(columns);
  const n = cols.length + 2;
  return {
    q: `SELECT * FROM ${tableName} AS OF $1 ${getOrderByFromCols(
      cols.length,
    )}LIMIT $${n} OFFSET $${n + 1}`,
    cols,
  };
};

// TODO: col.Key and col.Field for postgres
function getPKColsForRowsQuery(cs: RawRows): string[] {
  const pkCols = cs.filter(col => col.Key === "PRI");
  const cols = pkCols.map(c => c.Field);
  return cols;
}

// TODO: Postgres query
export const tableColsQueryAsOf = `DESCRIBE ?? AS OF ?`;

export function getTableCommitDiffQuery(
  cols: RawRows,
  hasFilter = false,
): string {
  const n = hasFilter ? 4 : 3;
  const whereDiffType = hasFilter ? ` WHERE diff_type=$4 ` : "";
  return `SELECT * FROM DOLT_DIFF($1, $2, $3)${whereDiffType}
  ${getOrderByFromDiffCols(cols)}
  LIMIT $${n + 1}
  OFFSET $${n + 2}`;
}

// TODO: col.Key for postgres
export function getOrderByFromDiffCols(cols: RawRows): string {
  const pkCols = cols.filter(col => col.Key === "PRI");
  const diffCols: string[] = [];
  pkCols.forEach(col => {
    diffCols.push(`to_${col.Field}`);
    diffCols.push(`from_${col.Field}`);
  });
  const orderBy = diffCols.map(c => `"${c}" ASC`).join(", ");
  return orderBy === "" ? "" : `ORDER BY ${orderBy} `;
}
