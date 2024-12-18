/* eslint-disable class-methods-use-this */

import { EntityManager, QueryRunner } from "typeorm";
import { QueryFactory } from "..";
import { SchemaType } from "../../schemas/schema.enums";
import { SchemaItem } from "../../schemas/schema.model";
import { TableDetails } from "../../tables/table.model";
import { BaseQueryFactory } from "../base";
import * as t from "../types";
import * as qh from "./queries";
import {
  getTableInfo,
  getTablePKColumns,
  getTableRows,
  getTables,
  mapTablesRes,
  notDoltError,
} from "./utils";

export class MySQLQueryFactory
  extends BaseQueryFactory
  implements QueryFactory
{
  isDolt = false;

  async checkoutDatabase(
    qr: QueryRunner,
    dbName: string,
    refName?: string,
  ): Promise<void> {
    await qr.query(qh.useDB(dbName, refName, this.isDolt));
  }

  async query<T>(
    q: string,
    p: t.Params,
    dbName?: string,
    refName?: string,
  ): Promise<T> {
    return this.handleAsyncQuery(async qr => {
      if (dbName) {
        await this.checkoutDatabase(qr, dbName, refName);
      }

      const res = await qr.query(q, p);
      return res;
    });
  }

  async queryMultiple<T>(
    executeQuery: (pq: t.ParQuery) => Promise<T>,
    dbName?: string,
    refName?: string,
  ): Promise<T> {
    return this.handleAsyncQuery(async qr => {
      async function query(q: string, p?: t.Params): t.PR {
        const res = await qr.query(q, p);
        return res;
      }

      if (dbName) {
        await this.checkoutDatabase(qr, dbName, refName);
      }

      return executeQuery(query);
    });
  }

  async queryForBuilder<T>(
    executeQuery: (em: EntityManager) => Promise<T>,
    dbName?: string,
    refName?: string,
  ): Promise<T> {
    return this.handleAsyncQuery(async qr => {
      if (dbName) {
        await this.checkoutDatabase(qr, dbName, refName);
      }

      return executeQuery(qr.manager);
    });
  }

  async queryQR<T>(
    executeQuery: (qr: QueryRunner) => Promise<T>,
    dbName?: string,
    refName?: string,
  ): Promise<T> {
    return this.handleAsyncQuery(async qr => {
      if (dbName) {
        await this.checkoutDatabase(qr, dbName, refName);
      }

      return executeQuery(qr);
    });
  }

  async databases(): Promise<string[]> {
    const res: t.RawRows = await this.query(qh.databasesQuery, []);
    return res
      .map(r => r.Database)
      .filter(
        db =>
          db !== "information_schema" &&
          db !== "mysql" &&
          db !== "dolt_cluster" &&
          !db.includes("/"),
      );
  }

  async getTableNames(args: t.RefArgs): Promise<string[]> {
    const res: t.RawRows = await this.query(
      qh.listTablesQuery,
      [],
      args.databaseName,
    );
    return mapTablesRes(res);
  }

  async getTableInfo(args: t.TableArgs): Promise<TableDetails | undefined> {
    return this.queryQR(
      async qr => getTableInfo(qr, args.tableName),
      args.databaseName,
    );
  }

  async getTables(args: t.RefArgs, tns: string[]): Promise<TableDetails[]> {
    return this.queryQR(async qr => getTables(qr, tns), args.databaseName);
  }

  async getTablePKColumns(args: t.TableArgs): Promise<string[]> {
    return this.queryQR(
      async qr => getTablePKColumns(qr, args.tableName),
      args.databaseName,
    );
  }

  async getTableRows(args: t.TableArgs, page: t.TableRowPagination): t.PR {
    return this.queryForBuilder(
      async em => getTableRows(em, args.tableName, page),
      args.databaseName,
      args.refName,
    );
  }

  async getSqlSelect(
    args: t.RefArgs & { queryString: string },
  ): Promise<{ rows: t.RawRows; warnings?: string[] }> {
    return this.queryMultiple(
      async query => {
        const rows = await query(args.queryString, [
          args.databaseName,
          args.refName,
        ]);
        const warningsRes = await query(qh.showWarningsQuery);
        const warnings = warningsRes.map(w => w.Message);
        return { rows, warnings };
      },
      args.databaseName,
      args.refName,
    );
  }

  async getSchemas(args: t.DBArgs, type?: SchemaType): Promise<SchemaItem[]> {
    return this.queryMultiple(async query => {
      const vRes = await query(qh.getViewsQuery, [args.databaseName]);
      const views = vRes.map(v => {
        return { name: v.TABLE_NAME, type: SchemaType.View };
      });
      if (type === SchemaType.View) {
        return views;
      }

      const tRes = await query(qh.getTriggersQuery);
      const triggers = tRes.map(tr => {
        return { name: tr.Trigger, type: SchemaType.Trigger };
      });

      const eRes = await query(qh.getEventsQuery);
      const events = eRes.map(e => {
        return { name: e.Name, type: SchemaType.Event };
      });

      return [...views, ...triggers, ...events];
    }, args.databaseName);
  }

  async getProcedures(args: t.DBArgs): Promise<SchemaItem[]> {
    const res: t.RawRows = await this.query(
      qh.proceduresQuery,
      [args.databaseName],
      args.databaseName,
    );
    return res.map(r => {
      return { name: r.Name, type: SchemaType.Procedure };
    });
  }

  // DOLT QUERIES NOT IMPLEMENTED FOR MYSQL

  // Returns static branch
  async getBranch(args: t.BranchArgs): t.USPR {
    return {
      name: args.branchName,
      latest_commit_date: new Date(),
      latest_committer: "",
      head: "",
    };
  }

  async getBranches(args: t.DBArgs & { offset: number }): t.PR {
    return this.getAllBranches(args);
  }

  async getAllBranches(args: t.DBArgs): t.PR {
    const branch = await this.getBranch({ ...args, branchName: "main" });
    return branch ? [branch] : [];
  }

  async createNewBranch(_: t.BranchArgs & { fromRefName: string }): t.PR {
    throw notDoltError("create new branch");
  }

  async callDeleteBranch(_: t.BranchArgs): t.PR {
    throw notDoltError("delete branch");
  }

  async getLogs(_args: t.RefArgs, _offset: number): t.PR {
    throw notDoltError("get logs");
  }

  async getTwoDotLogs(_args: t.RefsArgs): t.PR {
    throw notDoltError("get two dot logs");
  }

  async getDiffStat(_args: t.RefsArgs): t.PR {
    throw notDoltError("get diff stat");
  }

  async getThreeDotDiffStat(_args: t.RefsArgs): t.PR {
    throw notDoltError("get three dot diff stat");
  }

  async getDiffSummary(_args: t.RefsArgs): t.PR {
    throw notDoltError("get diff summary");
  }

  async getThreeDotDiffSummary(_args: t.RefsArgs): t.PR {
    throw notDoltError("get three dot diff summary");
  }

  async getSchemaPatch(_args: t.RefsTableArgs): t.PR {
    throw notDoltError("get schema patch");
  }

  async getThreeDotSchemaPatch(_args: t.RefsTableArgs): t.PR {
    throw notDoltError("get three dot schema patch");
  }

  async getSchemaDiff(_args: t.RefsTableArgs): t.PR {
    throw notDoltError("get schema diff");
  }

  async getThreeDotSchemaDiff(_args: t.RefsTableArgs): t.PR {
    throw notDoltError("get three dot schema diff");
  }

  async getDocs(_args: t.RefArgs): t.UPR {
    throw notDoltError("get docs");
  }

  async getStatus(_args: t.RefArgs): t.PR {
    throw notDoltError("get status");
  }

  async getTag(_args: t.TagArgs): t.UPR {
    throw notDoltError("get tag");
  }

  async getTags(_args: t.DBArgs): t.PR {
    throw notDoltError("get tags");
  }

  async createNewTag(
    _args: t.TagArgs & {
      fromRefName: string;
    },
  ): t.PR {
    throw notDoltError("create new tag");
  }

  async callDeleteTag(_args: t.TagArgs): t.PR {
    throw notDoltError("delete tag");
  }

  async callMerge(_args: t.BranchesArgs): Promise<boolean> {
    throw notDoltError("merge branches");
  }

  async resolveRefs(
    args: t.RefsArgs,
  ): Promise<{ fromCommitId: string; toCommitId: string }> {
    return { fromCommitId: args.fromRefName, toCommitId: args.toRefName };
  }

  async getOneSidedRowDiff(
    _args: t.TableArgs & { offset: number },
  ): Promise<{ rows: t.RawRows; columns: t.RawRows }> {
    throw notDoltError("get one-sided diff");
  }

  async getRowDiffs(_args: t.RowDiffArgs): t.DiffRes {
    throw notDoltError("get row sided diffs");
  }

  async restoreAllTables(_args: t.RefArgs): t.PR {
    throw notDoltError("restore all tables");
  }

  async getRemotes(_args: t.ListRemotesArgs): t.PR {
    throw notDoltError("get remotes");
  }

  async addRemote(_: t.AddRemoteArgs): t.PR {
    throw notDoltError("add remote");
  }

  async callDeleteRemote(_: t.RemoteArgs): t.PR {
    throw notDoltError("delete remote");
  }

  async callPullRemote(_: t.RemoteMaybeBranchArgs): t.PR {
    throw notDoltError("pull remote");
  }

  async callPushRemote(_: t.RemoteMaybeBranchArgs): t.PR {
    throw notDoltError("push remote");
  }

  async callFetchRemote(_: t.RemoteMaybeBranchArgs): t.PR {
    throw notDoltError("fetch remote");
  }
}
