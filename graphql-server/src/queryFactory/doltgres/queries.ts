import { RawRows, TableArgs } from "../types";

// Cannot use params here for the database revision. It will incorrectly
// escape refs with dots
export function useDB(dbName: string, refName?: string, isDolt = true): string {
  if (refName && isDolt) {
    return `USE "${dbName}/${refName}"`;
  }
  return `USE "${dbName}"`;
}

// TABLE

export const listTablesQuery = `SELECT table_schema, table_name FROM information_schema.tables WHERE table_type='BASE TABLE' AND table_schema = $1 AND table_catalog = $2`;

export const columnsQuery = `SELECT columns.*
FROM information_schema.columns 
WHERE table_name = $1 AND table_schema = $2 AND table_catalog = $3;`;

export const constraintsQuery = `SELECT 
ns.nspname AS table_schema, 
t.relname AS table_name, 
cnst.conname AS constraint_name,
pg_get_constraintdef(cnst.oid) AS expression,
CASE cnst.contype WHEN 'p' THEN 'PRIMARY' WHEN 'u' THEN 'UNIQUE' WHEN 'c' THEN 'CHECK' WHEN 'x' THEN 'EXCLUDE' END AS constraint_type, 
a.attname AS column_name
FROM pg_constraint cnst
INNER JOIN pg_class t ON t.oid = cnst.conrelid
INNER JOIN pg_namespace ns ON ns.oid = cnst.connamespace
LEFT JOIN pg_attribute a ON a.attrelid = cnst.conrelid AND a.attnum = ANY (cnst.conkey)
WHERE t.relkind IN ('r', 'p') AND ((ns.nspname = $1 AND t.relname = $2));`;

export const foreignKeysQuery = `SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE table_name=$1 AND table_schema=$2 AND table_catalog=$3
AND referenced_table_schema IS NOT NULL`;

export const indexQuery = `SELECT
  table_name,
  index_name,
  GROUP_CONCAT(comment) as COMMENTS,
  GROUP_CONCAT(non_unique) AS NON_UNIQUES,
  GROUP_CONCAT(column_name ORDER BY seq_in_index) AS COLUMNS
FROM information_schema.statistics
WHERE table_name=$1 AND table_schema=$2 AND table_catalog=$3 AND index_name!="PRIMARY"
GROUP BY index_name;`;

// export const tableColsQuery = `SHOW FULL TABLES WHERE table_type = 'BASE TABLE'`;

// BRANCHES

export const callNewBranch = `SELECT DOLT_BRANCH($1::text, $2::text)`;

export const callDeleteBranch = `SELECT DOLT_BRANCH('-D', $1::text)`;

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
  `SELECT DOLT_MERGE($1, '--no-ff', '-m', $2${getAuthorNameString(hasAuthor, "$3")})`;

// TAGS

export const callDeleteTag = `SELECT DOLT_TAG('-d', $1::text)`;

export const getCallNewTag = (hasMessage = false, hasAuthor = false) =>
  `SELECT DOLT_TAG($1::text, $2::text${hasMessage ? `, '-m', $3::text` : ""}${getAuthorNameString(
    hasAuthor,
    hasMessage ? "$4::text" : "$3::text",
  )})`;

export function getAuthorNameString(hasAuthor: boolean, n: string): string {
  if (!hasAuthor) return "";
  return `, '--author', ${n}`;
}

// TODO: Columns
// Creates ORDER BY statement with column parameters
// i.e. ORDER BY ::col1, ::col2
function getOrderByFromCols(numCols: number): string {
  if (!numCols) return "";
  const pkCols = Array.from({ length: numCols })
    .map((_, i) => `$${i + 1} ASC`)
    .join(", ");
  return pkCols === "" ? "" : `ORDER BY ${pkCols} `;
}

export const getRowsQueryAsOf = (
  columns: RawRows,
  args: TableArgs,
): { q: string; cols: string[] } => {
  const cols = getPKColsForRowsQuery(columns);
  const n = cols.length + 1;
  return {
    q: `SELECT * FROM "${args.databaseName}/${args.refName}"."${args.tableName}" ${getOrderByFromCols(
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

// export const tableColsQueryAsOf = `SELECT columns.*
// FROM "information_schema"."columns"
// WHERE "table_name" = $1 AND "table_schema" = $2 AND "table_catalog" = $3;`;

export function getTableCommitDiffQuery(
  cols: RawRows,
  hasFilter = false,
): string {
  const n = hasFilter ? 4 : 3;
  const whereDiffType = hasFilter ? ` WHERE diff_type=$4 ` : "";
  return `SELECT * FROM DOLT_DIFF($1::text, $2::text, $3::text)${whereDiffType}
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
