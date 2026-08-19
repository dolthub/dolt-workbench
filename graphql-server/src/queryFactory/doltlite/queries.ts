import {
  diffSelectClause,
  escapeIdentifier,
  escapeStringLiteral,
} from "../build/buildUtils";
import { RawRows } from "../types";

// TABLE

// Emits rows in MySQL DESCRIBE shape ({Field, Type, Null, Key}) so the shared
// diff/row models can consume them unchanged.
export const describeTableQuery = `SELECT
  name AS "Field",
  type AS "Type",
  CASE WHEN "notnull" = 1 THEN 'NO' ELSE 'YES' END AS "Null",
  CASE WHEN pk > 0 THEN 'PRI' ELSE '' END AS "Key"
FROM pragma_table_info(?) ORDER BY cid`;

export const listTableColumnsQuery = `SELECT name FROM pragma_table_info(?) ORDER BY cid`;

export const callResetHard = `SELECT dolt_reset('--hard')`;

// BRANCHES

export const callNewBranch = `SELECT dolt_branch(?, ?)`;

export const callDeleteBranch = `SELECT dolt_branch('-D', ?)`;

export const callCheckout = `SELECT dolt_checkout(?)`;

// COMMITS

// DoltLite's dolt_log() has no --parents flag; parent hashes come from the
// dolt_commit_ancestors system table, concatenated to match dolt's format.
const parentsSelect = `(SELECT group_concat(parent_hash, ', ') FROM (SELECT parent_hash FROM dolt_commit_ancestors a WHERE a.commit_hash = l.commit_hash ORDER BY a.parent_index)) AS parents`;

export const doltLogsQuery = `SELECT l.*, ${parentsSelect} FROM dolt_log(?) AS l LIMIT ? OFFSET ?`;

export const twoDotDoltLogsQuery = `SELECT l.*, ${parentsSelect} FROM dolt_log(?) AS l`;

// DIFFS

export const hashOf = `SELECT dolt_hashof(?)`;
export const mergeBase = `SELECT dolt_merge_base(?, ?)`;

export const getDiffStatQuery = (hasTableName?: boolean): string =>
  `SELECT * FROM dolt_diff_stat(?, ?${hasTableName ? `, ?` : ""})`;

export const getDiffSummaryQuery = (hasTableName?: boolean): string =>
  `SELECT * FROM dolt_diff_summary(?, ?${hasTableName ? `, ?` : ""})`;

export const schemaPatchQuery = `SELECT * FROM dolt_patch(?, ?, ?) WHERE diff_type='schema'`;

export const schemaDiffQuery = `SELECT * FROM dolt_schema_diff(?, ?, ?)`;

// dolt_diff_<table> called as a table function accepts arbitrary (from, to)
// refs — branches, commit hashes, WORKING — unlike the bare system table,
// which only materializes adjacent commit pairs.
export function getTableCommitDiffQuery(
  tableName: string,
  cols: RawRows,
  hasFilter = false,
): string {
  const whereDiffType = hasFilter ? ` WHERE diff_type=?` : "";
  return `SELECT * FROM ${escapeIdentifier(`dolt_diff_${tableName}`)}(?, ?)${whereDiffType}
  ${getOrderByFromDiffCols(cols)}
  LIMIT ?
  OFFSET ?`;
}

export function getCommitDiffQuery(
  tableName: string,
  columnNames: string[],
  fromRef: string,
  toRef: string,
  threeDot: boolean,
): string {
  // Three-dot semantics (diff from merge_base(to, from) to from) are handled
  // by the engine's range-spec parsing.
  const refArgs = threeDot
    ? escapeStringLiteral(`${toRef}...${fromRef}`)
    : `${escapeStringLiteral(fromRef)}, ${escapeStringLiteral(toRef)}`;
  return `SELECT ${diffSelectClause(columnNames, escapeIdentifier)} FROM ${escapeIdentifier(
    `dolt_diff_${tableName}`,
  )}(${refArgs})`;
}

export function getOrderByFromDiffCols(cols: RawRows): string {
  const pkCols = cols.filter(col => col.Key === "PRI");
  const diffCols: string[] = [];
  pkCols.forEach(col => {
    diffCols.push(`to_${col.Field}`);
    diffCols.push(`from_${col.Field}`);
  });
  const orderBy = diffCols.map(c => `${escapeIdentifier(c)} ASC`).join(", ");
  return orderBy === "" ? "" : `ORDER BY ${orderBy} `;
}

export function getOneSidedTableRowsQuery(
  tableName: string,
  cols: RawRows,
): string {
  return `SELECT * FROM ${escapeIdentifier(tableName)} ${getOrderByFromCols(
    cols,
  )}LIMIT ? OFFSET ?`;
}

// dolt_at_<table>(ref) reads a table pinned to any ref (branch, tag, commit
// hash, ancestry spec) — DoltLite's AS OF equivalent.
export function getAtTableRowsQuery(tableName: string): string {
  return `SELECT * FROM ${escapeIdentifier(
    `dolt_at_${tableName}`,
  )}(?) LIMIT ? OFFSET ?`;
}

function getOrderByFromCols(cols: RawRows): string {
  const pkCols = cols.filter(col => col.Key === "PRI");
  const orderBy = pkCols
    .map(c => `${escapeIdentifier(c.Field)} ASC`)
    .join(", ");
  return orderBy === "" ? "" : `ORDER BY ${orderBy} `;
}

// PULLS

// DoltLite's dolt_merge has no --author flag; merge authorship comes from
// the session-scoped user.name/user.email config instead.
export const callMergeQuery = `SELECT dolt_merge(?, '--no-ff', '-m', ?)`;

export const callConfig = `SELECT dolt_config(?, ?)`;

export const getConfig = `SELECT dolt_config(?) AS value`;

// Resolves conflicts materialized by an actual merge before it is committed.
export const getResolveConflicts = (numTables: number) =>
  `SELECT dolt_conflicts_resolve(?, ${Array.from(
    { length: numTables },
    () => `?`,
  ).join(", ")})`;

export const getCommitMerge = (hasAuthor = false) =>
  `SELECT dolt_commit('-Am', ?${hasAuthor ? `, '--author', ?` : ""})`;

// REMOTES

export const callAddRemote = `SELECT dolt_remote('add', ?, ?)`;

export const callDeleteRemote = `SELECT dolt_remote('remove', ?)`;

export const callPullRemote = `SELECT dolt_pull(?, ?)`;

export const callPushRemote = `SELECT dolt_push(?, ?)`;

export const callFetchRemote = `SELECT dolt_fetch(?)`;

export function getPushSourceBranch(branchName?: string): string | undefined {
  return branchName?.split(":", 1)[0];
}

// Single-arg clone into the current (required to be empty) database file.
export const callDoltClone = `SELECT dolt_clone(?)`;

const DOLTHUB_REMOTE_BASE = "https://doltliteremoteapi.dolthub.com";

export function getCloneRemoteUrl(remoteDbPath: string): string {
  const remote = remoteDbPath.trim();
  if (/^(?:file|https?):\/\//i.test(remote)) return remote;
  return `${DOLTHUB_REMOTE_BASE}/${remote}`;
}

// DoltLite requires dolt_test_run arguments to be SQL literals so its
// virtual table can resolve them during planning.
export const doltTestRun = (testIdentifier?: string): string =>
  `SELECT * FROM dolt_test_run(${
    testIdentifier ? escapeStringLiteral(testIdentifier) : ""
  })`;

// TAGS

export const callDeleteTag = `SELECT dolt_tag('-d', ?)`;

export const getCallNewTag = (hasMessage = false, hasAuthor = false) =>
  `SELECT dolt_tag(?, ?${hasMessage ? `, '-m', ?` : ""}${
    hasAuthor ? `, '--author', ?` : ""
  })`;
