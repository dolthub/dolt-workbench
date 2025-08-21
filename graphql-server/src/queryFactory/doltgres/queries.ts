import { convertToStringForQuery } from "../../rowDiffs/rowDiff.enums";
import { ROW_LIMIT } from "../../utils";
import { tableWithoutSchema } from "../postgres/utils";
import * as t from "../types";

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
  `DESCRIBE ${schemaName || "public"}."${tableWithoutSchema(tableName)}"`;

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

// TODO: Use prepared statements for these when they work with table functions
export const doltLogsQuery = (args: t.RefArgs, offset: number): string =>
  `SELECT * FROM DOLT_LOG('${args.refName}', '--parents') LIMIT ${ROW_LIMIT + 1} OFFSET ${offset}`;

export const twoDotDoltLogsQuery = (args: t.RefsArgs): string =>
  `SELECT * FROM DOLT_LOG('${args.toRefName}..${args.fromRefName}', '--parents')`;

// DIFFS

export const hashOf = `SELECT HASHOF($1::text)`;
export const mergeBase = `SELECT DOLT_MERGE_BASE($1::text, $2::text)`;

export const getThreeDotDiffStatQuery = (args: t.RefsMaybeTableArgs): string =>
  `SELECT * FROM DOLT_DIFF_STAT('${args.toRefName}...${args.fromRefName}'${args.tableName ? `, '${tableWithoutSchema(args.tableName)}'` : ""})`;

export const getDiffStatQuery = (args: t.RefsMaybeTableArgs): string =>
  `SELECT * FROM DOLT_DIFF_STAT('${args.fromRefName}', '${args.toRefName}'${args.tableName ? `, '${tableWithoutSchema(args.tableName)}'` : ""})`;

export const getDiffSummaryQuery = (args: t.RefsMaybeTableArgs): string =>
  `SELECT * FROM DOLT_DIFF_SUMMARY('${args.fromRefName}', '${args.toRefName}'${args.tableName ? `, '${tableWithoutSchema(args.tableName)}'` : ""})`;

export const getThreeDotDiffSummaryQuery = (
  args: t.RefsMaybeTableArgs,
): string =>
  `SELECT * FROM DOLT_DIFF_SUMMARY('${args.toRefName}...${args.fromRefName}'${args.tableName ? `, '${tableWithoutSchema(args.tableName)}'` : ""})`;

export const schemaPatchQuery = (args: t.RefsTableWithSchemaArgs): string =>
  `SELECT * FROM DOLT_PATCH('${args.fromRefName}', '${args.toRefName}', '${tableWithoutSchema(args.tableName)}') WHERE diff_type='schema'`;

export const threeDotSchemaPatchQuery = (
  args: t.RefsTableWithSchemaArgs,
): string =>
  `SELECT * FROM DOLT_PATCH('${args.toRefName}...${args.fromRefName}', '${tableWithoutSchema(args.tableName)}') WHERE diff_type='schema'`;

export const schemaDiffQuery = (args: t.RefsTableWithSchemaArgs): string =>
  `SELECT * FROM DOLT_SCHEMA_DIFF('${args.fromRefName}', '${args.toRefName}', '${tableWithoutSchema(args.tableName)}')`;

export const threeDotSchemaDiffQuery = (
  args: t.RefsTableWithSchemaArgs,
): string =>
  `SELECT * FROM DOLT_SCHEMA_DIFF('${args.toRefName}...${args.fromRefName}', '${tableWithoutSchema(args.tableName)}')`;

// PULLS

export const getCallMerge = (hasAuthor = false) =>
  `SELECT DOLT_MERGE($1::text, '--no-ff', '-m', $2::text${getAuthorNameString(hasAuthor, "$3::text")})`;

export const mergeConflictsSummaryQuery = `SELECT * FROM DOLT_PREVIEW_MERGE_CONFLICTS_SUMMARY($1::text, $2::text)`;

export const getMergeConflictsQuery = (offset: number) =>
  `SELECT * FROM DOLT_PREVIEW_MERGE_CONFLICTS($1::text, $2::text, $3::text) LIMIT ${ROW_LIMIT + 1} OFFSET ${offset}`;

export const resolveConflicts = `SELECT DOLT_CONFLICTS_RESOLVE($1::text, '.')`;

export const getCommitMerge = (hasAuthor = false) =>
  `CALL DOLT_COMMIT("-Am", $1::text${getAuthorNameString(hasAuthor, "$2::text")})`;

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

// Creates ORDER BY statement with column parameters
// i.e. ORDER BY ::col1, ::col2
function getOrderByFromCols(cols: string[]): string {
  if (!cols.length) return "";
  const pkCols = cols.map(col => `${col} ASC`).join(", ");
  return pkCols === "" ? "" : `ORDER BY ${pkCols} `;
}

export const getRowsQueryAsOf = (
  columns: t.RawRows,
  args: t.TableArgs & { offset: number },
): string => {
  const cols = getPKColsForRowsQuery(columns);
  return `SELECT * FROM ${args.tableName} AS OF '${args.refName}' ${getOrderByFromCols(
    cols,
  )}LIMIT ${ROW_LIMIT + 1} OFFSET ${args.offset}`;
};

function getPKColsForRowsQuery(cs: t.RawRows): string[] {
  const pkCols = cs.filter(col => col.Key === "PRI");
  const cols = pkCols.map(c => c.Field);
  return cols;
}

export const tableColsQueryAsOf = (
  tableName: string,
  refName: string,
  schemaName?: string,
) =>
  `DESCRIBE ${schemaName || "public"}."${tableWithoutSchema(tableName)}" AS OF '${refName}'`;

export function getTableCommitDiffQuery(
  args: t.RowDiffArgs,
  cols: t.RawRows,
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

export function getOrderByFromDiffCols(cols: t.RawRows): string {
  const pkCols = cols.filter(col => col.Key === "PRI");
  const diffCols: string[] = [];
  pkCols.forEach(col => {
    diffCols.push(`to_${col.Field}`);
    diffCols.push(`from_${col.Field}`);
  });
  const orderBy = diffCols.map(c => `"${c}" ASC`).join(", ");
  return orderBy === "" ? "" : `ORDER BY ${orderBy} `;
}

export const callResetHard = `SELECT DOLT_RESET('--hard')`;

export const callCheckoutTable = `SELECT DOLT_CHECKOUT($1::text)`;

// REMOTES

export const callAddRemote = `SELECT DOLT_REMOTE('add', $1::text, $2::text)`;

export const callDeleteRemote = `SELECT DOLT_REMOTE('remove', $1::text)`;

export const callPullRemote = `SELECT DOLT_PULL($1::text, $2::text)`;

export const callPushRemote = `SELECT DOLT_PUSH($1::text, $2::text)`;

export const callFetchRemote = `SELECT DOLT_FETCH($1::text)`;

export const callCreateBranchFromRemote = `CALL DOLT_BRANCH($1::text, $2::text)`;
