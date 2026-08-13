import { randomUUID } from "crypto";
import { DataSource, EntityManager, InsertResult, QueryRunner } from "typeorm";
import { QueryFactory } from "..";
import { doltliteDriver } from "../../connections/doltliteDriver";
import { CommitDiffType } from "../../diffSummaries/diffSummary.enums";
import { convertToStringForQuery } from "../../rowDiffs/rowDiff.enums";
import {
  DoltSystemTable,
  systemTableValues,
} from "../../systemTables/systemTable.enums";
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
  getTestIdentifierArg,
  handleRefNotFound,
  introspectColumns,
  pkValuesWithTypes,
  unionCols,
} from "../dolt/utils";
import { SqliteQueryFactory } from "../sqlite";
import * as t from "../types";
import * as qh from "./queries";

const PREVIEW_BRANCH_PREFIX = "__workbench_merge_preview_";
const DOLT_SYSTEM_TABLES = new Set<string>(systemTableValues);

type RevisionSource = {
  revision: string;
  ds: Promise<DataSource>;
  activeRunners: number;
  retired: boolean;
  destroyPromise?: Promise<void>;
};

async function destroyIfRetired(source: RevisionSource): Promise<void> {
  if (!source.retired || source.activeRunners > 0) return;
  source.destroyPromise ??= source.ds
    .then(async ds => {
      if (ds.isInitialized) await ds.destroy();
    })
    .catch(() => undefined);
  await source.destroyPromise;
}

export class DoltLiteQueryFactory
  extends SqliteQueryFactory
  implements QueryFactory
{
  isDolt = true;

  async getTableNames(
    args: t.RefArgs,
    filterSystemTables?: boolean,
  ): Promise<string[]> {
    const tables = await super.getTableNames(args);
    if (!filterSystemTables) return tables;
    return tables.filter(table => !DOLT_SYSTEM_TABLES.has(table));
  }

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

  // dolt_checkout only accepts branch names. Tags and commit hashes are
  // served from a read-only detached session instead, opened through the
  // engine's `file@revision` syntax, so the four query entry points fall
  // back to it when checkout rejects the ref. One page view fans out into
  // many resolver calls for the same revision, so the connection is cached
  // until a different revision is requested; the replaced source is only
  // destroyed once its in-flight runners finish.
  private revisionSource?: RevisionSource;

  async query<T>(
    q: string,
    p: t.Params,
    dbName?: string,
    refName?: string,
  ): Promise<T> {
    return this.withDetachedFallback(
      refName,
      dbName,
      async () => super.query(q, p, dbName, refName),
      async qr => qr.query(q, p) as Promise<T>,
    );
  }

  async queryMultiple<T>(
    executeQuery: (pq: t.ParQuery) => Promise<T>,
    dbName?: string,
    refName?: string,
  ): Promise<T> {
    return this.withDetachedFallback(
      refName,
      dbName,
      async () => super.queryMultiple(executeQuery, dbName, refName),
      async qr => executeQuery(async (q, p) => qr.query(q, p)),
    );
  }

  async queryForBuilder<T>(
    executeQuery: (em: EntityManager) => Promise<T>,
    dbName?: string,
    refName?: string,
  ): Promise<T> {
    return this.withDetachedFallback(
      refName,
      dbName,
      async () => super.queryForBuilder(executeQuery, dbName, refName),
      async qr => executeQuery(qr.manager),
    );
  }

  async queryQR<T>(
    executeQuery: (qr: QueryRunner) => Promise<T>,
    dbName?: string,
    refName?: string,
  ): Promise<T> {
    return this.withDetachedFallback(
      refName,
      dbName,
      async () => super.queryQR(executeQuery, dbName, refName),
      async qr => executeQuery(qr),
    );
  }

  // checkoutDatabase runs before any work in a unit, so a "no such branch"
  // failure means the work has not started and can safely run detached.
  private async withDetachedFallback<T>(
    refName: string | undefined,
    dbName: string | undefined,
    attempt: () => Promise<T>,
    detached: (qr: QueryRunner) => Promise<T>,
  ): Promise<T> {
    try {
      return await attempt();
    } catch (err) {
      if (
        !refName ||
        !err.message.includes(`no such branch or table: ${refName}`)
      ) {
        throw err;
      }
      // Resolve symbolic refs before caching so a moved/recreated tag or
      // relative ref opens its current commit instead of a stale session.
      const hashRows = await super.query<t.RawRows>(
        qh.hashOf,
        [refName],
        dbName,
      );
      const revision = Object.values(hashRows[0])[0] as string;
      const source = this.acquireRevisionSource(revision);
      try {
        const ds = await source.ds;
        const qr = ds.createQueryRunner();
        try {
          await qr.connect();
          return await detached(qr);
        } finally {
          await qr.release();
        }
      } finally {
        source.activeRunners -= 1;
        void destroyIfRetired(source);
      }
    }
  }

  async destroy(): Promise<void> {
    const source = this.revisionSource;
    this.revisionSource = undefined;
    if (!source) return;
    source.retired = true;
    await destroyIfRetired(source);
  }

  private acquireRevisionSource(revision: string): RevisionSource {
    const current = this.revisionSource;
    if (current?.revision === revision) {
      current.activeRunners += 1;
      return current;
    }
    const dsPromise = (async () => {
      const ds = new DataSource({
        type: "better-sqlite3",
        database: `${String(this.getDS().options.database)}@${revision}`,
        driver: doltliteDriver,
        statementCacheSize: 0,
        synchronize: false,
      });
      await ds.initialize();
      return ds;
    })();
    const source: RevisionSource = {
      revision,
      ds: dsPromise,
      activeRunners: 1,
      retired: false,
    };
    dsPromise.catch(() => {
      if (this.revisionSource === source) {
        this.revisionSource = undefined;
      }
    });
    this.revisionSource = source;
    if (current) {
      current.retired = true;
      void destroyIfRetired(current);
    }
    return source;
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
    return this.queryForBuilder(
      async em => dem.getDoltBranch(em, args),
      args.databaseName,
    );
  }

  async getBranches(args: t.ListBranchesArgs): t.PR {
    return this.queryForBuilder(
      async em => dem.getDoltBranchesPaginated(em, args),
      args.databaseName,
    );
  }

  async getAllBranches(args: t.DBArgs): t.PR {
    return this.queryForBuilder(
      async em => dem.getAllDoltBranches(em),
      args.databaseName,
    );
  }

  async getRemoteBranches(args: t.RemoteBranchesArgs): t.PR {
    return this.queryForBuilder(
      async em => dem.getDoltRemoteBranchesPaginated(em, args),
      args.databaseName,
    );
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
    return handleRefNotFound(async () =>
      this.query(
        qh.doltLogsQuery,
        [args.refName, ROW_LIMIT + 1, offset],
        args.databaseName,
      ),
    );
  }

  async getTwoDotLogs(args: t.RefsArgs): t.PR {
    return handleRefNotFound(async () =>
      this.query(
        qh.twoDotDoltLogsQuery,
        [`${args.toRefName}..${args.fromRefName}`],
        args.databaseName,
      ),
    );
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
    const oldCols = await this.describeAtRef(
      args,
      args.fromTableName,
      args.fromCommitId,
    );
    const newCols = await this.describeAtRef(
      args,
      args.toTableName,
      args.toCommitId,
    );
    const colsUnion = unionCols(oldCols, newCols);
    return this.queryMultiple(
      async query => {
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

  // Introspects a table's columns at a specific commit so diffs across
  // schema changes see both sides' historical columns. pragma introspection
  // follows the session's ref; the working-set pseudo-refs have no revision
  // database, so they read at the session branch.
  private async describeAtRef(
    args: t.RowDiffArgs,
    tableName: string,
    commitId: string,
  ): Promise<t.RawRows> {
    return this.query(
      qh.describeTableQuery,
      [tableName],
      args.databaseName,
      isWorkingSetRef(commitId) ? args.refName : commitId,
    );
  }

  // Rows for a one-sided diff come from the table itself (WORKING, which
  // dolt_at_ tables don't cover) or from dolt_at_<table>(ref) — DoltLite's
  // AS OF equivalent, which accepts branches, tags, and commit hashes.
  async getOneSidedRowDiff(
    args: t.TableArgs & { offset: number; branchRefName?: string },
  ): Promise<{ rows: t.RawRows; columns: t.RawRows }> {
    return this.queryMultiple(
      async query => {
        if (isWorkingSetRef(args.refName)) {
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
      },
      args.databaseName,
      // The WORKING path reads the live table, which is only correct with
      // the diff's branch checked out; dolt_at_ reads are pinned explicitly
      // but harmlessly share the checkout.
      args.branchRefName,
    );
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
        // Like builtSelect, the display query omits the pagination applied
        // to the executed one.
        const rows: t.RawRows = await qr.query(`${sql} LIMIT ? OFFSET ?`, [
          ROW_LIMIT + 1,
          args.offset ?? 0,
        ]);
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
        const built = buildDoltCellDiff(
          em,
          `dolt_diff_${args.tableName}`,
          {
            pkValues: bindableSystemTablePks(
              pkValuesWithTypes(args.pkValues, columns),
            ),
            columnNames: columns.map(c => c.name),
            columnName: args.columnName,
          },
          { limit: ROW_LIMIT + 1, offset: args.offset },
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
          { limit: ROW_LIMIT + 1, offset: args.offset },
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

  async getTag(args: t.TagArgs): t.UPR {
    return this.queryForBuilder(
      async em => dem.getDoltTag(em, args),
      args.databaseName,
    );
  }

  async getTags(args: t.DBArgs): t.PR {
    return this.queryForBuilder(
      async em => dem.getDoltTags(em),
      args.databaseName,
    );
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
      async query =>
        withAuthorConfig(query, args.author, async () => {
          await query(qh.callMergeQuery, [
            args.fromBranchName,
            `Merge branch ${args.fromBranchName}`,
          ]);
          return true;
        }),
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
      async query =>
        // A conflicted merge only leaves dolt_conflicts inspectable inside an
        // explicit transaction; the closing dolt_commit finalizes that
        // transaction itself, so there is no COMMIT here.
        withAuthorConfig(query, args.author, async () => {
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
        }),
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
      const previewBranch = `${PREVIEW_BRANCH_PREFIX}${randomUUID()}`;
      await query(qh.callNewBranch, [previewBranch, args.toBranchName]);
      await query(qh.callCheckout, [previewBranch]);
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
        return conflicted ? await read(query) : [];
      } finally {
        await rollbackIfActive(query);
        try {
          await query(qh.callCheckout, [args.toBranchName]);
          await query(qh.callDeleteBranch, [previewBranch]);
        } catch {
          // cleanup is best-effort; surface the original error instead
        }
      }
    }, args.databaseName);
  }

  async restoreAllTables(args: t.RefArgs): t.PR {
    return this.queryQR(
      async qr => {
        const res = await qr.query(qh.callResetHard);
        // Handles any new tables that weren't restored by dolt_reset(--hard)
        const status = await dem.getDoltStatus(qr.manager);
        for (const r of status.filter(r => r.status === "new table")) {
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
    return this.queryForBuilder(
      async em => {
        const built = buildSaveDoc(
          em,
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

  // DoltLite's remote functions return a bare scalar and report failure by
  // throwing, so success is mapped into the row shape fromPullRes,
  // fromPushRes, and fromFetchRes consume.
  async callPullRemote(args: t.RemoteMaybeBranchArgs): t.PR {
    return this.queryMultiple(
      async query => {
        await query(qh.callPullRemote, [args.remoteName, args.branchName]);
        return [{ fast_forward: "0", conflicts: "0", message: "" }];
      },
      args.databaseName,
      args.refName,
    );
  }

  async callPushRemote(args: t.RemoteMaybeBranchArgs): t.PR {
    return this.queryMultiple(
      async query => {
        await query(qh.callPushRemote, [args.remoteName, args.branchName]);
        return [{ status: "0", message: "" }];
      },
      args.databaseName,
      args.refName,
    );
  }

  async callFetchRemote(args: t.RemoteArgs): t.PR {
    return this.queryMultiple(async query => {
      await query(qh.callFetchRemote, [args.remoteName]);
      return [{ status: "0" }];
    }, args.databaseName);
  }

  async callCreateBranchFromRemote(args: t.RemoteBranchArgs): t.PR {
    return this.queryMultiple(async query => {
      await query(qh.callNewBranch, [
        args.branchName,
        `${args.remoteName}/${args.branchName}`,
      ]);
      return [{ status: "0" }];
    }, args.databaseName);
  }

  // Clones into the current database file, which the engine requires to be
  // empty.
  async callDoltClone(args: t.CloneArgs): Promise<void> {
    return this.handleAsyncQuery(async qr =>
      qr.query(qh.callDoltClone, [args.remoteDbPath]),
    );
  }

  // TESTS

  async getTests(args: t.RefArgs): t.PR {
    return this.queryForBuilder(
      async em => dem.getDoltTests(em),
      args.databaseName,
      args.refName,
    );
  }

  async runTests(args: t.RunTestsArgs): t.PR {
    const testIdentifier = getTestIdentifierArg(args.testIdentifier);
    return this.query(
      qh.doltTestRun(testIdentifier),
      undefined,
      args.databaseName,
      args.refName,
    );
  }

  async saveTests(args: t.SaveTestsArgs): Promise<InsertResult> {
    return this.queryForBuilder(
      async em => {
        const result = await dem.saveDoltTests(em, args.tests.list);
        // better-sqlite3 does not populate generatedMaps for virtual-table
        // inserts, but the resolver returns those maps as the saved list.
        if (result.generatedMaps.length === 0) {
          result.generatedMaps = args.tests.list.map(test => {
            return {
              test_name: test.testName,
              test_group: test.testGroup,
              test_query: test.testQuery,
              assertion_type: test.assertionType,
              assertion_comparator: test.assertionComparator,
              assertion_value: test.assertionValue,
            };
          });
        }
        return result;
      },
      args.databaseName,
      args.refName,
    );
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

// DoltLite's dolt_diff_/dolt_history_ system tables declare no column
// affinity, so numeric pk values must be bound as numbers to match. Integer
// pks bind as bigints to stay exact beyond Number's 2^53 precision.
function bindableSystemTablePks(pkValues: t.ColumnValue[]): t.ColumnValue[] {
  return pkValues.map(pk => {
    if (!pk.type || pk.value == null) return pk;
    const value = String(pk.value).trim();
    if (/int|numeric|decimal/i.test(pk.type) && /^[+-]?\d+$/.test(value)) {
      try {
        return { ...pk, value: BigInt(value) as unknown as string };
      } catch {
        return { ...pk, value: Number(value) as unknown as string };
      }
    }
    if (/real|double|float|numeric|decimal/i.test(pk.type)) {
      return { ...pk, value: Number(pk.value) as unknown as string };
    }
    return pk;
  });
}

// The working-set pseudo-refs are not revision databases: they resolve
// against the session branch's working set instead. The workbench never
// stages tables, so STAGED and WORKING read the same live state.
function isWorkingSetRef(ref?: string): boolean {
  return ref === "WORKING" || ref === "STAGED";
}

async function rollbackIfActive(query: t.ParQuery): Promise<void> {
  try {
    await query("ROLLBACK");
  } catch {
    // dolt procedures finalize the enclosing transaction themselves
  }
}

// dolt_merge has no --author flag, so merge authorship is applied through
// the session-scoped user config, restored afterward so one request's
// identity never leaks into later ones on the shared connection.
async function withAuthorConfig<T>(
  query: t.ParQuery,
  author: t.CommitAuthor | undefined,
  work: () => Promise<T>,
): Promise<T> {
  if (!author) return work();
  const priorName = await configValue(query, "user.name");
  const priorEmail = await configValue(query, "user.email");
  await query(qh.callConfig, ["user.name", author.name]);
  await query(qh.callConfig, ["user.email", author.email]);
  try {
    return await work();
  } finally {
    await query(qh.callConfig, ["user.name", priorName]);
    await query(qh.callConfig, ["user.email", priorEmail]);
  }
}

async function configValue(query: t.ParQuery, key: string): Promise<string> {
  const res = await query(qh.getConfig, [key]);
  return res[0].value;
}
