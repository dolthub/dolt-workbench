import { CommitDiffType } from "src/diffSummaries/diffSummary.enums";
import {
  DiffRowType,
  convertToStringForQuery,
} from "src/rowDiffs/rowDiff.enums";
import { systemTableValues } from "src/systemTables/systemTable.enums";
import { SortBranchesBy } from "../../branches/branch.enum";
import { SchemaType } from "../../schemas/schema.enums";
import { ROW_LIMIT, handleTableNotFound } from "../../utils";
import { MySQLQueryFactory } from "../mysql";
import * as myqh from "../mysql/queries";
import * as t from "../types";
import * as qh from "./queries";
import { handleRefNotFound, unionCols } from "./utils";

export class DoltQueryFactory
  extends MySQLQueryFactory
  implements t.QueryFactory
{
  isDolt = true;

  async getTableNames(args: t.RefArgs, filterSystemTables?: boolean): t.PR {
    return this.queryMultiple(
      async query => {
        const tables = await query(myqh.listTablesQuery, []);
        if (filterSystemTables) return tables;

        const systemTables: Array<t.RawRow | undefined> = await Promise.all(
          systemTableValues.map(async st => {
            const cols = await handleTableNotFound(async () =>
              query(myqh.columnsQuery, [st]),
            );
            if (cols) {
              return { [`Tables_in_${args.databaseName}`]: `${st}` };
            }
            return undefined;
          }),
        );
        return [...tables, ...(systemTables.filter(st => !!st) as t.RawRows)];
      },
      args.databaseName,
      args.refName,
    );
  }

  async getSchemas(args: t.RefArgs, type?: SchemaType): t.PR {
    const q = qh.getDoltSchemasQuery(!!type);
    const p = type ? [type] : [];
    return handleTableNotFound(async () =>
      this.query(q, p, args.databaseName, args.refName),
    );
  }

  async getProcedures(args: t.RefArgs): t.PR {
    return handleTableNotFound(async () =>
      this.query(qh.doltProceduresQuery, [], args.databaseName, args.refName),
    );
  }

  async getBranch(args: t.BranchArgs): t.PR {
    return this.query(qh.branchQuery, [args.branchName], args.databaseName);
  }

  async getBranches(args: t.DBArgs & { sortBy?: SortBranchesBy }): t.PR {
    return this.query(qh.getBranchesQuery(args.sortBy), [], args.databaseName);
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

  async getDiffStat(args: t.RefsArgs & { tableName?: string }): t.PR {
    return this.query(
      qh.getDiffStatQuery(!!args.tableName),
      [args.fromRefName, args.toRefName, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotDiffStat(args: t.RefsArgs & { tableName?: string }): t.PR {
    return this.query(
      qh.getThreeDotDiffStatQuery(!!args.tableName),
      [`${args.toRefName}...${args.fromRefName}`, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getDiffSummary(args: t.RefsArgs & { tableName?: string }): t.PR {
    return this.query(
      qh.getDiffSummaryQuery(!!args.tableName),
      [args.fromRefName, args.toRefName, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotDiffSummary(
    args: t.RefsArgs & { tableName?: string },
  ): t.PR {
    return this.query(
      qh.getThreeDotDiffSummaryQuery(!!args.tableName),
      [`${args.toRefName}...${args.fromRefName}`, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getSchemaPatch(args: t.RefsArgs & { tableName: string }): t.PR {
    return this.query(
      qh.schemaPatchQuery,
      [args.fromRefName, args.toRefName, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotSchemaPatch(args: t.RefsArgs & { tableName: string }): t.PR {
    return this.query(
      qh.threeDotSchemaPatchQuery,
      [`${args.toRefName}...${args.fromRefName}`, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getSchemaDiff(args: t.RefsArgs & { tableName: string }): t.PR {
    return this.query(
      qh.schemaDiffQuery,
      [args.fromRefName, args.toRefName, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotSchemaDiff(args: t.RefsArgs & { tableName: string }): t.PR {
    return this.query(
      qh.threeDotSchemaDiffQuery,
      [`${args.toRefName}...${args.fromRefName}`, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getDocs(args: t.RefArgs): t.UPR {
    return handleTableNotFound(async () =>
      this.query(qh.docsQuery, [], args.databaseName, args.refName),
    );
  }

  async getStatus(args: t.RefArgs): t.PR {
    return this.query(qh.statusQuery, [], args.databaseName, args.refName);
  }

  async getTag(args: t.TagArgs): t.PR {
    return this.query(qh.tagQuery, [args.tagName], args.databaseName);
  }

  async getTags(args: t.DBArgs): t.PR {
    return this.query(qh.tagsQuery, [], args.databaseName);
  }

  async createNewTag(
    args: t.TagArgs & {
      fromRefName: string;
      message?: string;
    },
  ): t.PR {
    return this.query(
      qh.getCallNewTag(!!args.message),
      [args.tagName, args.fromRefName, args.message],
      args.databaseName,
    );
  }

  async callDeleteTag(args: t.TagArgs): t.PR {
    return this.query(qh.callDeleteTag, [args.tagName], args.databaseName);
  }

  async callMerge(args: t.BranchesArgs): Promise<t.RawRow> {
    return this.queryMultiple(
      async query => {
        await query("BEGIN");

        const res = await query(qh.callMerge, [
          args.fromBranchName,
          `Merge branch ${args.fromBranchName}`,
          // TODO: add commit author
          //  commitAuthor: {
          //    name: currentUser.username,
          //    email: currentUser.emailAddressesList[0].address,
          //   },
        ]);

        if (res.length && res[0].conflicts !== "0") {
          await query("ROLLBACK");
          throw new Error("Merge conflict detected");
        }

        await query("COMMIT");
        return true;
      },
      args.databaseName,
      args.toBranchName,
    );
  }

  async resolveRefs(
    args: t.RefsArgs & { type?: CommitDiffType },
  ): Promise<{ fromCommitId: string; toCommitId: string }> {
    if (args.type !== CommitDiffType.ThreeDot) {
      return { fromCommitId: args.fromRefName, toCommitId: args.toRefName };
    }
    return this.queryMultiple(
      async query => {
        const toCommitId = await query(qh.hashOf, [args.fromRefName]);
        const mergeBaseCommit = await query(qh.mergeBase, [
          args.toRefName,
          args.fromRefName,
        ]);
        return {
          fromCommitId: Object.values(mergeBaseCommit[0])[0],
          toCommitId: Object.values(toCommitId[0])[0],
        };
      },
      args.databaseName,
      args.refName,
    );
  }

  async getOneSidedRowDiff(
    args: t.TableArgs & { offset: number },
  ): Promise<{ rows: t.RawRows; columns: t.RawRows }> {
    return this.queryMultiple(
      async query => {
        const columns = await query(qh.tableColsQueryAsOf, [
          args.tableName,
          args.refName,
        ]);
        const { q, cols } = qh.getRowsQueryAsOf(columns);
        const rows = await query(q, [
          args.tableName,
          args.refName,
          ...cols,
          ROW_LIMIT + 1,
          args.offset,
        ]);
        return { rows, columns };
      },
      args.databaseName,
      args.refName,
    );
  }

  async getRowDiffs(
    args: t.DBArgs & {
      refName?: string;
      tableName: string;
      fromTableName: string;
      toTableName: string;
      fromCommitId: string;
      toCommitId: string;
      offset: number;
      filterByRowType?: DiffRowType;
    },
  ): Promise<{ colsUnion: t.RawRows; diff: t.RawRows }> {
    return this.queryMultiple(
      async query => {
        const oldCols = await query(qh.tableColsQueryAsOf, [
          args.fromTableName,
          args.fromCommitId,
        ]);
        const newCols = await query(qh.tableColsQueryAsOf, [
          args.toTableName,
          args.toCommitId,
        ]);
        const colsUnion = unionCols(oldCols, newCols);
        const diffType = convertToStringForQuery(args.filterByRowType);
        const refArgs = [args.fromCommitId, args.toCommitId, args.toTableName];
        const pageArgs = [ROW_LIMIT + 1, args.offset];
        const diffs = await query(
          qh.getTableCommitDiffQuery(colsUnion, !!diffType),
          diffType
            ? [...refArgs, diffType, ...pageArgs]
            : [...refArgs, ...pageArgs],
        );
        return { colsUnion, diffs };
      },
      args.databaseName,
      args.refName,
    );
  }
}
