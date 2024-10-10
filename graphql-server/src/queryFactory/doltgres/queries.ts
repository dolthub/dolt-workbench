import { convertToStringForQuery } from "../../rowDiffs/rowDiff.enums";
import { ROW_LIMIT } from "../../utils";
import { tableWithSchema, tableWithoutSchema } from "../postgres/utils";
import { RawRows, RowDiffArgs, TableArgs } from "../types";

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

export const columnsQuery = (schemaName: string, tableName: string) =>
  `DESCRIBE ${tableWithSchema({ schemaName, tableName })};`;

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

export const hashOf = `SELECT HASHOF($1::text)`;
export const mergeBase = `SELECT DOLT_MERGE_BASE($1::text, $2::text)`;

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
  `SELECT DOLT_MERGE($1::text, '--no-ff', '-m', $2::text${getAuthorNameString(hasAuthor, "$3::text")})`;

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
function getOrderByFromCols(cols: string[]): string {
  if (!cols.length) return "";
  const pkCols = cols.map(col => `${col} ASC`).join(", ");
  return pkCols === "" ? "" : `ORDER BY ${pkCols} `;
}

export const getRowsQueryAsOf = (
  columns: RawRows,
  args: TableArgs & { offset: number },
): string => {
  const cols = getPKColsForRowsQuery(columns);
  return `SELECT * FROM ${args.tableName} AS OF '${args.refName}' ${getOrderByFromCols(
    cols,
  )}LIMIT ${ROW_LIMIT + 1} OFFSET ${args.offset}`;
};

// TODO: col.Key and col.Field for postgres
function getPKColsForRowsQuery(cs: RawRows): string[] {
  const pkCols = cs.filter(col => col.Key === "PRI");
  const cols = pkCols.map(c => c.Field);
  return cols;
}

export const tableColsQueryAsOf = (tableName: string, refName: string) =>
  `DESCRIBE ${tableName} AS OF '${refName}'`;

export function getTableCommitDiffQuery(
  args: RowDiffArgs,
  cols: RawRows,
): string {
  const diffType = convertToStringForQuery(args.filterByRowType);
  const whereDiffType = args.filterByRowType
    ? ` WHERE diff_type=${diffType} `
    : "";
  return `SELECT * FROM DOLT_DIFF('${args.fromCommitId}', '${args.toCommitId}', '${tableWithoutSchema(args.toTableName)}')${whereDiffType}
  ${getOrderByFromDiffCols(cols)}
  LIMIT ${ROW_LIMIT + 1}
  OFFSET ${args.offset}`;
}

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
