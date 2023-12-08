import { Injectable } from "@nestjs/common";
import { QueryRunner } from "typeorm";
import { SortBranchesBy } from "../branches/branch.enum";
import { QueryFactory } from "../queryFactory/types";
import { SchemaType } from "../schemas/schema.enums";
import { ROW_LIMIT, handleTableNotFound } from "../utils";
import { TableArgs } from "../utils/commonTypes";
import * as qh from "./dataSource.queries";
import * as t from "./types";
import { handleRefNotFound } from "./utils";

export const dbNotFoundErr = "Database connection not found";
export type ParQuery = (q: string, p?: any[] | undefined) => t.PR;

@Injectable()
export class DataSourceService {
  // private isDolt: boolean | undefined;

  constructor(private qf: QueryFactory | undefined) {}

  // UTILS

  getQF(): QueryFactory {
    if (!this.qf) {
      throw new Error("Query factory not initialized");
    }
    return this.qf;
  }

  async handleAsyncQuery(
    work: (qr: QueryRunner) => Promise<any>,
  ): Promise<any> {
    return this.getQF().handleAsyncQuery(work);
  }

  // Assumes Dolt database
  async query(
    executeQuery: (pq: ParQuery) => any,
    dbName?: string,
    refName?: string,
  ): Promise<any> {
    return this.handleAsyncQuery(async qr => {
      async function query(q: string, p?: any[] | undefined): t.PR {
        const res = await qr.query(q, p);
        return res;
      }

      if (dbName) {
        await qr.query(qh.useDBStatement(dbName, refName));
      }

      return executeQuery(query);
    });
  }

  async query2(
    q: string,
    p: any[],
    dbName?: string,
    refName?: string,
  ): Promise<any> {
    return this.handleAsyncQuery(async qr => {
      if (dbName) {
        await qr.query(qh.useDBStatement(dbName, refName));
      }

      const res = await qr.query(q, p);
      return res;
    });
  }

  async getIsDolt(): Promise<boolean> {
    return this.getQF().isDolt;
  }

  // Queries that will work on both MySQL and Dolt
  async queryMaybeDolt(
    executeQuery: (pq: ParQuery, isDolt: boolean) => any,
    dbName?: string,
    refName?: string,
  ): Promise<any> {
    return this.handleAsyncQuery(async qr => {
      async function query(q: string, p?: any[] | undefined): t.PR {
        const res = await qr.query(q, p);
        return res;
      }

      const isDolt = await this.getIsDolt();
      if (dbName) {
        await qr.query(qh.useDBStatement(dbName, refName, isDolt));
      }

      return executeQuery(query, isDolt);
    });
  }

  async queryMaybeDolt2(
    q: string,
    p: any[],
    dbName?: string,
    refName?: string,
    notDoltFn?: (qr: QueryRunner) => t.UPR,
  ): Promise<{ res: any; isDolt: boolean }> {
    return this.handleAsyncQuery(async qr => {
      const isDolt = await this.getIsDolt();
      if (dbName) {
        await qr.query(qh.useDBStatement(dbName, refName, isDolt));
      }

      if (!isDolt) {
        if (notDoltFn) {
          return notDoltFn(qr);
        }
        return { res: [], isDolt: false };
      }

      const res = await qr.query(q, p);

      return { res, isDolt };
    });
  }

  // QUERIES

  async databases(): t.PR {
    return this.query2(qh.databasesQuery, []);
  }

  async currentDatabase(): Promise<string> {
    return this.handleAsyncQuery(async qr => qr.getCurrentDatabase());
  }

  async createDatabase(args: t.DBArgs): t.PR {
    return this.handleAsyncQuery(async qr =>
      qr.createDatabase(args.databaseName),
    );
  }

  async getTableColumns(args: TableArgs): t.PR {
    return this.getQF().getTableColumns(args);
  }

  async getTableRows(args: t.TableArgs, page: t.TableRowPagination): t.PR {
    const { q, cols } = qh.getRowsQuery(page.columns);
    return this.query2(
      q,
      [args.tableName, ...cols, ROW_LIMIT + 1, page.offset],
      args.databaseName,
      args.refName,
    );
  }

  async getSqlSelect(args: t.RefArgs & { queryString: string }): t.IsDoltRes {
    return this.queryMaybeDolt2(
      args.queryString,
      [],
      args.databaseName,
      args.refName,
      async qr => qr.query(args.queryString),
    );
  }

  // DOLT-SPECIFIC QUERIES

  async getDoltSchemas(args: t.RefArgs, type?: SchemaType): t.IsDoltRes {
    return handleTableNotFound(async () =>
      this.queryMaybeDolt2(
        qh.getDoltSchemasQuery(!!type),
        [type],
        args.databaseName,
        args.refName,
        async qr => {
          const vRes = await qr.query(qh.getViewsQuery, [args.databaseName]);
          const views = vRes.map(v => {
            return { name: v.TABLE_NAME, type: SchemaType.View };
          });
          if (type === SchemaType.View) {
            return views;
          }

          const tRes = await qr.query(qh.getTriggersQuery);
          const triggers = tRes.map(tr => {
            return { name: tr.Trigger, type: SchemaType.Trigger };
          });

          const eRes = await qr.query(qh.getEventsQuery);
          const events = eRes.map(e => {
            return { name: e.Name, type: SchemaType.Event };
          });

          return [...views, ...triggers, ...events];
        },
      ),
    );
  }

  async getDoltProcedures(args: t.RefArgs): t.IsDoltRes {
    return handleTableNotFound(async () =>
      this.queryMaybeDolt2(
        qh.doltProceduresQuery,
        [],
        args.databaseName,
        args.refName,
        async qr => qr.query(qh.getProceduresQuery, [args.databaseName]),
      ),
    );
  }

  async getBranch(args: t.BranchArgs): t.IsDoltRes {
    return this.queryMaybeDolt2(
      qh.branchQuery,
      [args.branchName],
      args.databaseName,
    );
  }

  async getBranches(args: t.DBArgs & { sortBy?: SortBranchesBy }): t.IsDoltRes {
    return this.queryMaybeDolt2(
      qh.getBranchesQuery(args.sortBy),
      [],
      args.databaseName,
    );
  }

  async createNewBranch(args: t.BranchArgs & { fromRefName: string }): t.PR {
    return this.query2(
      qh.callNewBranch,
      [args.branchName, args.fromRefName],
      args.databaseName,
    );
  }

  async callDeleteBranch(args: t.BranchArgs): t.PR {
    return this.query2(
      qh.callDeleteBranch,
      [args.branchName],
      args.databaseName,
    );
  }

  async getLogs(args: t.RefArgs, offset: number): t.PR {
    return handleRefNotFound(async () =>
      this.query2(
        qh.doltLogsQuery,
        [args.refName, ROW_LIMIT + 1, offset],
        args.databaseName,
      ),
    );
  }

  async getTwoDotLogs(args: t.RefsArgs): t.PR {
    return handleRefNotFound(async () =>
      this.query2(
        qh.twoDotDoltLogsQuery,
        [`${args.toRefName}..${args.fromRefName}`],
        args.databaseName,
      ),
    );
  }

  async getDiffStat(args: t.RefsArgs & { tableName?: string }): t.PR {
    return this.query2(
      qh.getDiffStatQuery(!!args.tableName),
      [args.fromRefName, args.toRefName, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotDiffStat(args: t.RefsArgs & { tableName?: string }): t.PR {
    return this.query2(
      qh.getThreeDotDiffStatQuery(!!args.tableName),
      [`${args.toRefName}...${args.fromRefName}`, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getDiffSummary(args: t.RefsArgs & { tableName?: string }): t.PR {
    return this.query2(
      qh.getDiffSummaryQuery(!!args.tableName),
      [args.fromRefName, args.toRefName, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotDiffSummary(
    args: t.RefsArgs & { tableName?: string },
  ): t.PR {
    return this.query2(
      qh.getThreeDotDiffSummaryQuery(!!args.tableName),
      [`${args.toRefName}...${args.fromRefName}`, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getSchemaPatch(args: t.RefsArgs & { tableName: string }): t.PR {
    return this.query2(
      qh.schemaPatchQuery,
      [args.fromRefName, args.toRefName, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotSchemaPatch(args: t.RefsArgs & { tableName: string }): t.PR {
    return this.query2(
      qh.threeDotSchemaPatchQuery,
      [`${args.toRefName}...${args.fromRefName}`, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getSchemaDiff(args: t.RefsArgs & { tableName: string }): t.PR {
    return this.query2(
      qh.schemaDiffQuery,
      [args.fromRefName, args.toRefName, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotSchemaDiff(args: t.RefsArgs & { tableName: string }): t.PR {
    return this.query2(
      qh.threeDotSchemaDiffQuery,
      [`${args.toRefName}...${args.fromRefName}`, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getDocs(args: t.RefArgs): t.UPR {
    return handleTableNotFound(async () =>
      this.query2(qh.docsQuery, [], args.databaseName, args.refName),
    );
  }

  async getStatus(args: t.RefArgs): t.PR {
    return this.query2(qh.statusQuery, [], args.databaseName, args.refName);
  }

  async getTag(args: t.TagArgs): t.PR {
    return this.query2(qh.tagQuery, [args.tagName], args.databaseName);
  }

  async getTags(args: t.DBArgs): t.PR {
    return this.query2(qh.tagsQuery, [], args.databaseName);
  }

  async createNewTag(
    args: t.TagArgs & {
      fromRefName: string;
      message?: string;
    },
  ): t.PR {
    return this.query2(
      qh.getCallNewTag(!!args.message),
      [args.tagName, args.fromRefName, args.message],
      args.databaseName,
    );
  }

  async callDeleteTag(args: t.TagArgs): t.PR {
    return this.query2(qh.callDeleteTag, [args.tagName], args.databaseName);
  }

  async callMerge(args: t.BranchesArgs): Promise<t.RawRow> {
    return this.query(
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
}
