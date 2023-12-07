import { Injectable } from "@nestjs/common";
import { DataSource, QueryRunner } from "typeorm";
import { SortBranchesBy } from "../branches/branch.enum";
import { SchemaType } from "../schemas/schema.enums";
import { handleTableNotFound } from "../tables/table.resolver";
import { ROW_LIMIT } from "../utils";
import { RawRows, TableArgs } from "../utils/commonTypes";
import * as qh from "./dataSource.queries";
import {
  BranchArgs,
  BranchesArgs,
  DBArgs,
  IsDoltRes,
  PR,
  RawRow,
  RefArgs,
  RefsArgs,
  TableRowPagination,
  TagArgs,
  UPR,
} from "./types";
import { handleRefNotFound } from "./utils";

export const dbNotFoundErr = "Database connection not found";
export type ParQuery = (q: string, p?: any[] | undefined) => Promise<RawRows>;

@Injectable()
export class DataSourceService {
  private isDolt: boolean | undefined;

  constructor(private ds: DataSource | undefined) {}

  // UTILS

  getDS(): DataSource {
    const { ds } = this;
    if (!ds) throw new Error(dbNotFoundErr);
    return ds;
  }

  getQR(): QueryRunner {
    return this.getDS().createQueryRunner();
  }

  async handleAsyncQuery(
    work: (qr: QueryRunner) => Promise<any>,
  ): Promise<any> {
    const qr = this.getQR();
    try {
      await qr.connect();
      const res = await work(qr);
      return res;
    } finally {
      await qr.release();
    }
  }

  // Assumes Dolt database
  async query(
    executeQuery: (pq: ParQuery) => any,
    dbName?: string,
    refName?: string,
  ): Promise<any> {
    return this.handleAsyncQuery(async qr => {
      async function query(q: string, p?: any[] | undefined): Promise<RawRows> {
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
    p: Array<any>,
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

  async getIsDoltHelper(qr: QueryRunner): Promise<boolean> {
    if (this.isDolt !== undefined) {
      return this.isDolt;
    }
    try {
      const res = await qr.query("SELECT dolt_version()");
      this.isDolt = !!res;
      return !!res;
    } catch (_) {
      this.isDolt = false;
      return false;
    }
  }

  async getIsDolt(): Promise<boolean> {
    return this.handleAsyncQuery(async qr => {
      return this.getIsDoltHelper(qr);
    });
  }

  // Queries that will work on both MySQL and Dolt
  async queryMaybeDolt(
    executeQuery: (pq: ParQuery, isDolt: boolean) => any,
    dbName?: string,
    refName?: string,
  ): Promise<any> {
    return this.handleAsyncQuery(async qr => {
      async function query(q: string, p?: any[] | undefined): Promise<RawRows> {
        const res = await qr.query(q, p);
        return res;
      }

      const isDolt = await this.getIsDoltHelper(qr);
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
    notDoltFn?: (qr: QueryRunner) => UPR,
  ): Promise<{ res: any; isDolt: boolean }> {
    return this.handleAsyncQuery(async qr => {
      const isDolt = await this.getIsDoltHelper(qr);
      if (dbName) {
        await qr.query(qh.useDBStatement(dbName, refName, isDolt));
      }

      if (!isDolt) {
        if (notDoltFn) {
          return notDoltFn(qr);
        }
        return undefined;
      }

      const res = await qr.query(q, p);

      return { res, isDolt };
    });
  }

  // QUERIES

  async databases(): PR {
    return this.query2(qh.databasesQuery, []);
  }

  async currentDatabase(): Promise<string> {
    return this.handleAsyncQuery(async qr => qr.getCurrentDatabase());
  }

  async createDatabase(args: DBArgs): PR {
    return this.handleAsyncQuery(async qr =>
      qr.createDatabase(args.databaseName),
    );
  }

  async getTableColumns(args: TableArgs): PR {
    return this.query2(
      qh.tableColsQuery,
      [args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getTableRows(args: TableArgs, page: TableRowPagination): PR {
    const { q, cols } = qh.getRowsQuery(page.columns);
    return this.query2(
      q,
      [args.tableName, ...cols, ROW_LIMIT + 1, page.offset],
      args.databaseName,
      args.refName,
    );
  }

  async getSqlSelect(args: RefArgs & { queryString: string }): IsDoltRes {
    return this.queryMaybeDolt2(
      args.queryString,
      [],
      args.databaseName,
      args.refName,
      async (qr: QueryRunner) => qr.query(args.queryString),
    );
  }

  // DOLT-SPECIFIC QUERIES

  async getDoltSchemas(args: RefArgs, type?: SchemaType): IsDoltRes {
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
          const triggers = tRes.map(t => {
            return { name: t.Trigger, type: SchemaType.Trigger };
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

  async getDoltProcedures(args: RefArgs): IsDoltRes {
    return handleTableNotFound(async () =>
      this.queryMaybeDolt2(
        qh.doltProceduresQuery,
        [],
        args.databaseName,
        args.refName,
        async (qr: QueryRunner) =>
          qr.query(qh.getProceduresQuery, [args.databaseName]),
      ),
    );
  }

  async getBranch(args: BranchArgs): IsDoltRes {
    return this.queryMaybeDolt2(
      qh.branchQuery,
      [args.branchName],
      args.databaseName,
    );
  }

  async getBranches(args: DBArgs & { sortBy?: SortBranchesBy }): IsDoltRes {
    return this.queryMaybeDolt2(
      qh.getBranchesQuery(args.sortBy),
      [],
      args.databaseName,
    );
  }

  async createNewBranch(args: BranchArgs & { fromRefName: string }): PR {
    return this.query2(
      qh.callNewBranch,
      [args.branchName, args.fromRefName],
      args.databaseName,
    );
  }

  async callDeleteBranch(args: BranchArgs): PR {
    return this.query2(
      qh.callDeleteBranch,
      [args.branchName],
      args.databaseName,
    );
  }

  async getLogs(args: RefArgs, offset: number): PR {
    return handleRefNotFound(async () =>
      this.query2(
        qh.doltLogsQuery,
        [args.refName, ROW_LIMIT + 1, offset],
        args.databaseName,
      ),
    );
  }

  async getTwoDotLogs(args: RefsArgs): PR {
    return handleRefNotFound(async () =>
      this.query2(
        qh.twoDotDoltLogsQuery,
        [`${args.toRefName}..${args.fromRefName}`],
        args.databaseName,
      ),
    );
  }

  async getDiffStat(args: RefsArgs & { tableName?: string }): PR {
    return this.query2(
      qh.getDiffStatQuery(!!args.tableName),
      [args.fromRefName, args.toRefName, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotDiffStat(args: RefsArgs & { tableName?: string }): PR {
    return this.query2(
      qh.getThreeDotDiffStatQuery(!!args.tableName),
      [`${args.toRefName}...${args.fromRefName}`, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getDiffSummary(args: RefsArgs & { tableName?: string }): PR {
    return this.query2(
      qh.getDiffSummaryQuery(!!args.tableName),
      [args.fromRefName, args.toRefName, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotDiffSummary(args: RefsArgs & { tableName?: string }): PR {
    return this.query2(
      qh.getThreeDotDiffSummaryQuery(!!args.tableName),
      [`${args.toRefName}...${args.fromRefName}`, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getSchemaPatch(args: RefsArgs & { tableName: string }): PR {
    return this.query2(
      qh.schemaPatchQuery,
      [args.fromRefName, args.toRefName, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotSchemaPatch(args: RefsArgs & { tableName: string }): PR {
    return this.query2(
      qh.threeDotSchemaPatchQuery,
      [`${args.toRefName}...${args.fromRefName}`, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getSchemaDiff(args: RefsArgs & { tableName: string }): PR {
    return this.query2(
      qh.schemaDiffQuery,
      [args.fromRefName, args.toRefName, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getThreeDotSchemaDiff(args: RefsArgs & { tableName: string }): PR {
    return this.query2(
      qh.threeDotSchemaDiffQuery,
      [`${args.toRefName}...${args.fromRefName}`, args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getDocs(args: RefArgs): UPR {
    return handleTableNotFound(async () =>
      this.query2(qh.docsQuery, [], args.databaseName, args.refName),
    );
  }

  async getStatus(args: RefArgs): PR {
    return this.query2(qh.statusQuery, [], args.databaseName, args.refName);
  }

  async getTag(args: TagArgs): PR {
    return this.query2(qh.tagQuery, [args.tagName], args.databaseName);
  }

  async getTags(args: DBArgs): PR {
    return this.query2(qh.tagsQuery, [], args.databaseName);
  }

  async createNewTag(
    args: TagArgs & {
      fromRefName: string;
      message?: string;
    },
  ): PR {
    return this.query2(
      qh.getCallNewTag(!!args.message),
      [args.tagName, args.fromRefName, args.message],
      args.databaseName,
    );
  }

  async callDeleteTag(args: TagArgs): PR {
    return this.query2(qh.callDeleteTag, [args.tagName], args.databaseName);
  }

  async callMerge(args: BranchesArgs): Promise<RawRow> {
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
