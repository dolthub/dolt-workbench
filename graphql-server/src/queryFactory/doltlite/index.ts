import { QueryRunner } from "typeorm";
import { QueryFactory } from "..";
import { CommitDiffType } from "../../diffSummaries/diffSummary.enums";
import { convertToStringForQuery } from "../../rowDiffs/rowDiff.enums";
import { DoltSystemTable } from "../../systemTables/systemTable.enums";
import { ROW_LIMIT } from "../../utils";
import { buildCallProcedure } from "../build/buildCallProcedure";
import { buildDeleteRow } from "../build/buildDeleteRow";
import { buildDoltCellDiff } from "../build/buildDoltCellDiff";
import { buildDoltCellHistory } from "../build/buildDoltCellHistory";
import { buildSaveDoc } from "../build/buildSaveDoc";
import {
  DDL_EXECUTION_MESSAGE,
  mutationExecutionMessage,
} from "../build/buildUtils";
import * as dem from "../dolt/doltEntityManager";
import {
  getAuthorString,
  handleRefNotFound,
  introspectColumns,
  pkValuesWithTypes,
  unionCols,
} from "../dolt/utils";
import { SqliteQueryFactory } from "../sqlite";
import * as t from "../types";
import * as qh from "./queries";

const PREVIEW_BRANCH = "__workbench_merge_preview";

export class DoltLiteQueryFactory
  extends SqliteQueryFactory
  implements QueryFactory
{
  isDolt = true;

  // DoltLite has no `USE db/branch`; branch scoping is done by checking out
  // the ref inside the serialized query unit.
  async checkoutDatabase(
    qr: QueryRunner,
    _dbName: string,
    refName?: string,
  ): Promise<void> {
    if (refName) {
      await qr.query(qh.callCheckout, [refName]);
    }
  }

  async callProcedure(args: t.CallProcedureArgs): Promise<t.MutationResult> {
    return this.queryQR(
      async qr => {
        const built = buildCallProcedure(qr.manager, args.name, args.args);
        await built.execute();
        return {
          rowsAffected: 0,
          queryString: built.displaySql,
          executionMessage: DDL_EXECUTION_MESSAGE,
        };
      },
      args.databaseName,
      args.refName,
    );
  }

  async getStatus(args: t.RefArgs): t.PR {
    return this.queryForBuilder(
      async em => dem.getDoltStatus(em),
      args.databaseName,
      args.refName,
    );
  }

  // BRANCHES

  async getBranch(args: t.BranchArgs): t.USPR {
    const branch = await this.queryForBuilder(
      async em => dem.getDoltBranch(em, args),
      args.databaseName,
    );
    return branch
      ? withUTCDates([branch], ["latest_commit_date"])[0]
      : branch;
  }

  async getBranches(args: t.ListBranchesArgs): t.PR {
    const branches = await this.queryForBuilder(
      async em => dem.getDoltBranchesPaginated(em, args),
      args.databaseName,
    );
    return withUTCDates(branches, ["latest_commit_date"]);
  }

  async getAllBranches(args: t.DBArgs): t.PR {
    const branches = await this.queryForBuilder(
      async em => dem.getAllDoltBranches(em),
      args.databaseName,
    );
    return withUTCDates(branches, ["latest_commit_date"]);
  }

  async getRemoteBranches(_: t.RemoteBranchesArgs): t.PR {
    throw new Error("Remote branches are not supported for DoltLite databases");
  }

  async createNewBranch(args: t.BranchArgs & { fromRefName: string }): t.PR {
    return this.query(
      qh.callNewBranch,
      [args.branchName, args.fromRefName],
      args.databaseName,
    );
  }

  async callDeleteBranch(args: t.BranchArgs): t.PR {
    return this.query(
      qh.callDeleteBranch,
      [args.branchName],
      args.databaseName,
    );
  }

  // COMMITS

  async getLogs(args: t.RefArgs, offset: number): t.PR {
    return handleRefNotFound(async () => {
      const logs: t.RawRows = await this.query(
        qh.doltLogsQuery,
        [args.refName, ROW_LIMIT + 1, offset],
        args.databaseName,
      );
      return withUTCDates(logs, ["date"]);
    });
  }

  async getTwoDotLogs(args: t.RefsArgs): t.PR {
    return handleRefNotFound(async () => {
      const logs: t.RawRows = await this.query(
        qh.twoDotDoltLogsQuery,
        [`${args.toRefName}..${args.fromRefName}`],
        args.databaseName,
      );
      return withUTCDates(logs, ["date"]);
    });
  }

  // DIFFS

  async getDiffStat(args: t.RefsMaybeTableArgs): t.PR {
    return this.query(
      qh.getDiffStatQuery(!!args.tableName),
      diffParams(args.fromRefName, args.toRefName, args.tableName),
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotDiffStat(args: t.RefsMaybeTableArgs): t.PR {
    return this.queryMultiple(
      async query => {
        const { from, to } = await resolveThreeDotRefs(
          query,
          args.toRefName,
          args.fromRefName,
        );
        return query(
          qh.getDiffStatQuery(!!args.tableName),
          diffParams(from, to, args.tableName),
        );
      },
      args.databaseName,
      args.refName,
    );
  }

  async getDiffSummary(args: t.RefsMaybeTableArgs): t.PR {
    return this.query(
      qh.getDiffSummaryQuery(!!args.tableName),
      diffParams(args.fromRefName, args.toRefName, args.tableName),
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotDiffSummary(args: t.RefsMaybeTableArgs): t.PR {
    return this.queryMultiple(
      async query => {
        const { from, to } = await resolveThreeDotRefs(
          query,
          args.toRefName,
          args.fromRefName,
        );
        return query(
          qh.getDiffSummaryQuery(!!args.tableName),
          diffParams(from, to, args.tableName),
        );
      },
      args.databaseName,
      args.refName,
    );
  }

  async getSchemaPatch(args: t.RefsTableArgs): t.PR {
    return this.query(
      qh.schemaPatchQuery,
      [args.fromRefName, args.toRefName, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotSchemaPatch(args: t.RefsTableArgs): t.PR {
    return this.queryMultiple(
      async query => {
        const { from, to } = await resolveThreeDotRefs(
          query,
          args.toRefName,
          args.fromRefName,
        );
        return query(qh.schemaPatchQuery, [from, to, args.tableName]);
      },
      args.databaseName,
      args.refName,
    );
  }

  async getSchemaDiff(args: t.RefsTableArgs): t.PR {
    return this.query(
      qh.schemaDiffQuery,
      [args.fromRefName, args.toRefName, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotSchemaDiff(args: t.RefsTableArgs): t.PR {
    return this.queryMultiple(
      async query => {
        const { from, to } = await resolveThreeDotRefs(
          query,
          args.toRefName,
          args.fromRefName,
        );
        return query(qh.schemaDiffQuery, [from, to, args.tableName]);
      },
      args.databaseName,
      args.refName,
    );
  }

  async resolveRefs(
    args: t.RefsArgs & { type?: CommitDiffType },
  ): t.CommitsRes {
    if (args.type !== CommitDiffType.ThreeDot) {
      return { fromCommitId: args.fromRefName, toCommitId: args.toRefName };
    }
    return this.queryMultiple(
      async query => {
        const { from, to } = await resolveThreeDotRefs(
          query,
          args.toRefName,
          args.fromRefName,
        );
        return { fromCommitId: from, toCommitId: to };
      },
      args.databaseName,
      args.refName,
    );
  }

  async getMergeBase(args: t.RefsArgs): Promise<string> {
    const res: t.RawRow = await this.query(
      qh.mergeBase,
      [args.toRefName, args.fromRefName],
      args.databaseName,
    );
    return Object.values(res[0])[0] as string;
  }

  // ROW DIFFS

  async getTableRowsWithDiff(
    args: t.TableArgs,
    rows: t.RawRows,
    page: t.TableRowPagination,
  ): t.PR {
    return this.queryForBuilder(
      async em => dem.getTableRowsWithDiff(em, args.tableName, rows, page),
      args.databaseName,
      args.refName,
    );
  }

  async getWorkingDiffRows(
    args: t.TableArgs,
    page: t.TableRowPagination,
  ): t.PR {
    return this.queryForBuilder(
      async em => dem.getWorkingDiffRows(em, args.tableName, page),
      args.databaseName,
      args.refName,
    );
  }

  async getRowDiffs(args: t.RowDiffArgs): t.DiffRes {
    return this.queryMultiple(
      async query => {
        const oldCols = await query(qh.describeTableQuery, [
          args.fromTableName,
        ]);
        const newCols = await query(qh.describeTableQuery, [args.toTableName]);
        const colsUnion = unionCols(oldCols, newCols);
        const diffType = convertToStringForQuery(args.filterByRowType);
        const refArgs = [args.fromCommitId, args.toCommitId];
        const pageArgs = [ROW_LIMIT + 1, args.offset];
        const diff = await query(
          qh.getTableCommitDiffQuery(args.toTableName, colsUnion, !!diffType),
          diffType
            ? [...refArgs, diffType, ...pageArgs]
            : [...refArgs, ...pageArgs],
        );
        return { colsUnion, diff };
      },
      args.databaseName,
      args.refName,
    );
  }

  // Rows for a one-sided diff come from the table itself (WORKING, which
  // dolt_at_ tables don't cover) or from dolt_at_<table>(ref) — DoltLite's
  // AS OF equivalent, which accepts branches, tags, and commit hashes.
  async getOneSidedRowDiff(
    args: t.TableArgs & { offset: number },
  ): Promise<{ rows: t.RawRows; columns: t.RawRows }> {
    return this.queryMultiple(async query => {
      if (args.refName === "WORKING") {
        const columns = await query(qh.describeTableQuery, [args.tableName]);
        const rows = await query(
          qh.getOneSidedTableRowsQuery(args.tableName, columns),
          [ROW_LIMIT + 1, args.offset],
        );
        return { rows, columns };
      }
      const columns = await query(qh.describeTableQuery, [
        `dolt_at_${args.tableName}`,
      ]);
      const rows = await query(qh.getAtTableRowsQuery(args.tableName), [
        args.refName,
        ROW_LIMIT + 1,
        args.offset,
      ]);
      return { rows, columns };
    }, args.databaseName);
  }

  async doltCommitDiff(args: t.DoltCommitDiffArgs): Promise<t.SqlSelectResult> {
    const columns = await introspectColumns(
      async () => this.getTableInfo(args),
      args.tableName,
    );
    const excluded = new Set(args.excludedColumns ?? []);
    const columnNames = columns.map(c => c.name).filter(n => !excluded.has(n));
    return this.queryQR(
      async qr => {
        const sql = qh.getCommitDiffQuery(
          args.tableName,
          columnNames,
          args.fromCommitId,
          args.toCommitId,
          args.type === CommitDiffType.ThreeDot,
        );
        const rows: t.RawRows = await qr.query(sql);
        return {
          rows,
          isMutation: false,
          executionMessage: "",
          queryString: sql,
        };
      },
      args.databaseName,
      args.refName,
    );
  }

  async doltCellDiff(args: t.DoltCellLookupArgs): Promise<t.SqlSelectResult> {
    const columns = await introspectColumns(
      async () => this.getTableInfo(args),
      args.tableName,
    );
    return this.queryForBuilder(
      async em => {
        const built = buildDoltCellDiff(em, `dolt_diff_${args.tableName}`, {
          pkValues: bindableSystemTablePks(
            pkValuesWithTypes(args.pkValues, columns),
          ),
          columnNames: columns.map(c => c.name),
          columnName: args.columnName,
        });
        return {
          rows: await built.execute(),
          isMutation: false,
          executionMessage: "",
          queryString: built.displaySql,
        };
      },
      args.databaseName,
      args.refName,
    );
  }

  async doltCellHistory(
    args: t.DoltCellLookupArgs,
  ): Promise<t.SqlSelectResult> {
    const columns = await introspectColumns(
      async () => this.getTableInfo(args),
      args.tableName,
    );
    return this.queryForBuilder(
      async em => {
        const built = buildDoltCellHistory(
          em,
          `dolt_history_${args.tableName}`,
          {
            pkValues: bindableSystemTablePks(
              pkValuesWithTypes(args.pkValues, columns),
            ),
            columnNames: columns.map(c => c.name),
            columnName: args.columnName,
          },
        );
        return {
          rows: await built.execute(),
          isMutation: false,
          executionMessage: "",
          queryString: built.displaySql,
        };
      },
      args.databaseName,
      args.refName,
    );
  }

  // TAGS

  // getDoltTag returns a single row despite the t.UPR list typing, matching
  // the dolt factory's behavior.
  async getTag(args: t.TagArgs): t.UPR {
    const tag = (await this.queryForBuilder(
      async em => dem.getDoltTag(em, args),
      args.databaseName,
    )) as t.RawRow | undefined;
    if (!tag) return undefined;
    return withUTCDates([tag], ["date"])[0] as unknown as t.RawRows;
  }

  async getTags(args: t.DBArgs): t.PR {
    const tags = await this.queryForBuilder(
      async em => dem.getDoltTags(em),
      args.databaseName,
    );
    return withUTCDates(tags, ["date"]);
  }

  async createNewTag(
    args: t.TagArgs & {
      fromRefName: string;
      message?: string;
      author?: t.CommitAuthor;
    },
  ): t.PR {
    const params = [args.tagName, args.fromRefName];
    if (args.message) {
      params.push(args.message);
    }
    if (args.author) {
      params.push(getAuthorString(args.author));
    }
    return this.query(
      qh.getCallNewTag(!!args.message, !!args.author),
      params,
      args.databaseName,
    );
  }

  async callDeleteTag(args: t.TagArgs): t.PR {
    return this.query(qh.callDeleteTag, [args.tagName], args.databaseName);
  }

  // MERGES

  // In autocommit mode DoltLite finalizes a clean merge itself and rolls a
  // conflicted merge back with a descriptive error, so no explicit
  // transaction is needed here.
  async callMerge(
    args: t.BranchesArgs & { author?: t.CommitAuthor },
  ): Promise<boolean> {
    return this.queryMultiple(
      async query => {
        await applyAuthorConfig(query, args.author);
        await query(qh.callMergeQuery, [
          args.fromBranchName,
          `Merge branch ${args.fromBranchName}`,
        ]);
        return true;
      },
      args.databaseName,
      args.toBranchName,
    );
  }

  async callMergeWithResolveConflicts(
    args: t.BranchesArgs & {
      author?: t.CommitAuthor;
      oursTables: string[];
      theirsTables: string[];
    },
  ): Promise<boolean> {
    return this.queryMultiple(
      async query => {
        // A conflicted merge only leaves dolt_conflicts inspectable inside an
        // explicit transaction; the closing dolt_commit finalizes that
        // transaction itself, so there is no COMMIT here.
        await applyAuthorConfig(query, args.author);
        await query("BEGIN");
        try {
          const msg = `Merge branch ${args.fromBranchName}`;
          try {
            await query(qh.callMergeQuery, [args.fromBranchName, msg]);
            // The merge succeeded without the expected conflicts and has
            // already been committed.
            return true;
          } catch (err) {
            if (!err.message.includes("conflict")) throw err;
          }
          if (args.oursTables.length) {
            await query(qh.getResolveConflicts(args.oursTables.length), [
              "--ours",
              ...args.oursTables,
            ]);
          }
          if (args.theirsTables.length) {
            await query(qh.getResolveConflicts(args.theirsTables.length), [
              "--theirs",
              ...args.theirsTables,
            ]);
          }
          const commitParams = [msg];
          if (args.author) {
            commitParams.push(getAuthorString(args.author));
          }
          await query(qh.getCommitMerge(!!args.author), commitParams);
        } catch (err) {
          await rollbackIfActive(query);
          throw err;
        }
        return true;
      },
      args.databaseName,
      args.toBranchName,
    );
  }

  async getPullConflictsSummary(args: t.BranchesArgs): t.PR {
    return this.previewMergeConflicts(args, async query =>
      query(qh.conflictsSummaryQuery),
    );
  }

  async getPullRowConflicts(
    args: t.BranchesArgs & { tableName: string; offset: number },
  ): t.PR {
    return this.previewMergeConflicts(args, async query =>
      query(qh.getConflictRowsQuery(args.tableName), [
        ROW_LIMIT + 1,
        args.offset,
      ]),
    );
  }

  // DoltLite has no preview_merge_conflicts functions, but a conflicted
  // merge inside an explicit transaction materializes dolt_conflicts for
  // inspection. The merge runs on a throwaway branch so that the clean-merge
  // case (which auto-commits) never touches the real branch, then everything
  // is rolled back and the branch deleted.
  private async previewMergeConflicts(
    args: t.BranchesArgs,
    read: (query: t.ParQuery) => t.PR,
  ): t.PR {
    return this.queryMultiple(async query => {
      try {
        await query(qh.callDeleteBranch, [PREVIEW_BRANCH]);
      } catch {
        // no stale preview branch to clean up
      }
      await query(qh.callNewBranch, [PREVIEW_BRANCH, args.toBranchName]);
      await query(qh.callCheckout, [PREVIEW_BRANCH]);
      try {
        let conflicted = false;
        await query("BEGIN");
        try {
          await query(qh.callMergeQuery, [
            args.fromBranchName,
            "merge conflict preview",
          ]);
        } catch (err) {
          if (!err.message.includes("conflict")) throw err;
          conflicted = true;
        }
        const rows = conflicted ? await read(query) : [];
        await rollbackIfActive(query);
        return rows;
      } finally {
        await query(qh.callCheckout, [args.toBranchName]);
        await query(qh.callDeleteBranch, [PREVIEW_BRANCH]);
      }
    }, args.databaseName);
  }

  async restoreAllTables(args: t.RefArgs): t.PR {
    return this.queryQR(
      async qr => {
        const res = await qr.query(qh.callResetHard);
        // Handles any new tables that weren't restored by dolt_reset(--hard)
        const status = await dem.getDoltStatus(qr.manager);
        for (const r of status) {
          await qr.query(qh.callCheckout, [r.table_name]);
        }
        return res;
      },
      args.databaseName,
      args.refName,
    );
  }

  // DOCS

  async getDocs(args: t.RefArgs): t.UPR {
    return this.queryForBuilder(
      async em => dem.getDoltDocs(em),
      args.databaseName,
      args.refName,
    );
  }

  async saveDoc(args: t.SaveDocArgs): Promise<t.MutationResult> {
    return this.queryQR(
      async qr => {
        // DoltLite has no built-in dolt_docs table; it is materialized as a
        // plain versioned table on first save.
        await qr.query(qh.createDocsTableQuery);
        const built = buildSaveDoc(
          qr.manager,
          DoltSystemTable.DOCS,
          args.docName,
          args.markdown,
        );
        await built.execute();
        return {
          rowsAffected: 1,
          queryString: built.displaySql,
          executionMessage: mutationExecutionMessage(1),
        };
      },
      args.databaseName,
      args.refName,
    );
  }

  async deleteDoc(args: t.DeleteDocArgs): Promise<t.MutationResult> {
    return this.queryForBuilder(
      async em => {
        const built = buildDeleteRow(em, DoltSystemTable.DOCS, [
          { column: "doc_name", value: args.docName, type: "varchar" },
        ]);
        const result = await built.execute();
        const rowsAffected = result.affected ?? 0;
        return {
          rowsAffected,
          queryString: built.displaySql,
          executionMessage: mutationExecutionMessage(rowsAffected),
        };
      },
      args.databaseName,
      args.refName,
    );
  }

  // REMOTES

  async getRemotes(args: t.ListRemotesArgs): t.PR {
    return this.queryForBuilder(
      async em => dem.getDoltRemotesPaginated(em, args),
      args.databaseName,
    );
  }

  async addRemote(args: t.AddRemoteArgs): t.PR {
    return this.query(
      qh.callAddRemote,
      [args.remoteName, args.remoteUrl],
      args.databaseName,
    );
  }

  async callDeleteRemote(args: t.RemoteArgs): t.PR {
    return this.query(
      qh.callDeleteRemote,
      [args.remoteName],
      args.databaseName,
    );
  }

  async callPullRemote(args: t.RemoteMaybeBranchArgs): t.PR {
    return this.query(
      qh.callPullRemote,
      [args.remoteName, args.branchName],
      args.databaseName,
      args.refName,
    );
  }

  async callPushRemote(args: t.RemoteMaybeBranchArgs): t.PR {
    return this.query(
      qh.callPushRemote,
      [args.remoteName, args.branchName],
      args.databaseName,
      args.refName,
    );
  }

  async callFetchRemote(args: t.RemoteArgs): t.PR {
    return this.query(qh.callFetchRemote, [args.remoteName], args.databaseName);
  }

  async callCreateBranchFromRemote(args: t.RemoteBranchArgs): t.PR {
    return this.query(
      qh.callNewBranch,
      [args.branchName, `${args.remoteName}/${args.branchName}`],
      args.databaseName,
    );
  }

  // Clones into the current database file, which the engine requires to be
  // empty.
  async callDoltClone(args: t.CloneArgs): Promise<void> {
    return this.handleAsyncQuery(async qr =>
      qr.query(qh.callDoltClone, [args.remoteDbPath]),
    );
  }

  // TESTS

  async getTests(_args: t.RefArgs): t.PR {
    return [];
  }

  async runTests(_args: t.RunTestsArgs): t.PR {
    throw new Error("Dolt tests are not supported for DoltLite databases");
  }

  async saveTests(_args: t.SaveTestsArgs): Promise<never> {
    throw new Error("Dolt tests are not supported for DoltLite databases");
  }
}

function diffParams(
  fromRefName: string,
  toRefName: string,
  tableName?: string,
): t.Params {
  return tableName
    ? [fromRefName, toRefName, tableName]
    : [fromRefName, toRefName];
}

// Emulates dolt's `to...from` ref syntax, which DoltLite's diff functions
// don't parse: three-dot diffs compare merge_base(to, from) against from.
async function resolveThreeDotRefs(
  query: t.ParQuery,
  toRefName: string,
  fromRefName: string,
): Promise<{ from: string; to: string }> {
  const baseRes = await query(qh.mergeBase, [toRefName, fromRefName]);
  const headRes = await query(qh.hashOf, [fromRefName]);
  return {
    from: Object.values(baseRes[0])[0] as string,
    to: Object.values(headRes[0])[0] as string,
  };
}

// DoltLite returns datetime columns as UTC strings, but the shared models
// expect JS Date objects like the MySQL driver produces.
function withUTCDates(rows: t.RawRows, dateCols: string[]): t.RawRows {
  return rows.map(row => {
    const converted = { ...row };
    dateCols.forEach(col => {
      if (typeof converted[col] === "string") {
        converted[col] = new Date(`${converted[col].replace(" ", "T")}Z`);
      }
    });
    return converted;
  });
}

// DoltLite's dolt_diff_/dolt_history_ system tables declare no column
// affinity, so numeric pk values must be bound as numbers to match.
function bindableSystemTablePks(pkValues: t.ColumnValue[]): t.ColumnValue[] {
  return pkValues.map(pk => {
    if (pk.type && /int|real|double|float|numeric|decimal/i.test(pk.type)) {
      return { ...pk, value: Number(pk.value) as unknown as string };
    }
    return pk;
  });
}

async function rollbackIfActive(query: t.ParQuery): Promise<void> {
  try {
    await query("ROLLBACK");
  } catch {
    // dolt procedures finalize the enclosing transaction themselves
  }
}

// dolt_merge has no --author flag, so merge authorship is applied through
// the session-scoped user config instead.
async function applyAuthorConfig(
  query: t.ParQuery,
  author?: t.CommitAuthor,
): Promise<void> {
  if (!author) return;
  await query(qh.callConfig, ["user.name", author.name]);
  await query(qh.callConfig, ["user.email", author.email]);
}
