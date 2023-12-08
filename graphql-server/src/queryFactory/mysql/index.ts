import { QueryRunner } from "typeorm";
import { DiffRowType } from "../../rowDiffs/rowDiff.enums";
import { SchemaType } from "../../schemas/schema.enums";
import { ROW_LIMIT } from "../../utils";
import { BaseQueryFactory } from "../base";
import * as t from "../types";
import * as qh from "./queries";
import { notDoltError } from "./utils";

export class MySQLQueryFactory
  extends BaseQueryFactory
  implements t.QueryFactory
{
  isDolt = false;

  async getUseDB(
    qr: QueryRunner,
    dbName: string,
    refName?: string,
  ): Promise<void> {
    await qr.query(qh.useDB(dbName, refName, this.isDolt));
  }

  async query(
    q: string,
    p: any[],
    dbName?: string,
    refName?: string,
  ): Promise<any> {
    return this.handleAsyncQuery(async qr => {
      if (dbName) {
        await this.getUseDB(qr, dbName, refName);
      }

      const res = await qr.query(q, p);
      return res;
    });
  }

  async queryMultiple(
    executeQuery: (pq: t.ParQuery) => Promise<any>,
    dbName?: string,
    refName?: string,
  ): Promise<any> {
    return this.handleAsyncQuery(async qr => {
      async function query(q: string, p?: any[] | undefined): t.PR {
        const res = await qr.query(q, p);
        return res;
      }

      if (dbName) {
        await this.getUseDB(qr, dbName, refName);
      }

      return executeQuery(query);
    });
  }

  async databases(): t.PR {
    return this.query(qh.databasesQuery, []);
  }

  async getTableNames(args: t.RefArgs): t.PR {
    return this.query(qh.listTablesQuery, [], args.databaseName);
  }

  async getTableInfo(args: t.TableArgs): t.PR {
    return this.queryMultiple(
      async query => [getTableInfoWithQR(query, args, this.isDolt)],
      args.databaseName,
      args.refName,
    );
  }

  async getTables(args: t.RefArgs, tns: string[]): t.PR {
    return this.queryMultiple(async query => {
      const tableInfos = await Promise.all(
        tns.map(async name => {
          const row = await getTableInfoWithQR(
            query,
            {
              ...args,
              tableName: name,
            },
            this.isDolt,
          );
          return row;
        }),
      );
      return tableInfos;
    }, args.databaseName);
  }

  async getTableColumns(args: t.TableArgs): t.PR {
    return this.query(
      qh.tableColsQuery,
      [args.tableName],
      args.databaseName,
      args.refName,
    );
  }

  async getTableRows(args: t.TableArgs, page: t.TableRowPagination): t.PR {
    const { q, cols } = qh.getRowsQuery(page.columns);
    return this.query(
      q,
      [args.tableName, ...cols, ROW_LIMIT + 1, page.offset],
      args.databaseName,
      args.refName,
    );
  }

  async getSqlSelect(args: t.RefArgs & { queryString: string }): t.PR {
    return this.query(args.queryString, [], args.databaseName, args.refName);
  }

  async getSchemas(args: t.DBArgs, type?: SchemaType): t.PR {
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

  async getProcedures(args: t.DBArgs): t.PR {
    return this.query(qh.proceduresQuery, [], args.databaseName);
  }

  // DOLT QUERIES NOT IMPLEMENTED FOR MYSQL

  // Returns static branch
  async getBranch(args: t.BranchArgs): t.PR {
    return [
      {
        name: args.branchName,
        latest_commit_date: new Date(),
        latest_committer: "",
        head: "",
      },
    ];
  }

  async getBranches(args: t.DBArgs): t.PR {
    return this.getBranch({ ...args, branchName: "main" });
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

  async getSchemaPatch(_args: t.RefsArgs & { tableName: string }): t.PR {
    throw notDoltError("get schema patch");
  }

  async getThreeDotSchemaPatch(
    _args: t.RefsArgs & { tableName: string },
  ): t.PR {
    throw notDoltError("get three dot schema patch");
  }

  async getSchemaDiff(_args: t.RefsArgs & { tableName: string }): t.PR {
    throw notDoltError("get schema diff");
  }

  async getThreeDotSchemaDiff(_args: t.RefsArgs & { tableName: string }): t.PR {
    throw notDoltError("get three dot schema diff");
  }

  async getDocs(_args: t.RefArgs): t.UPR {
    throw notDoltError("get docs");
  }

  async getStatus(_args: t.RefArgs): t.PR {
    throw notDoltError("get status");
  }

  async getTag(_args: t.TagArgs): t.PR {
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

  async callMerge(_args: t.BranchesArgs): Promise<t.RawRow> {
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

  async getRowDiffs(
    _args: t.DBArgs & {
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
    throw notDoltError("get row sided diffs");
  }
}

async function getTableInfoWithQR(
  query: t.ParQuery,
  args: t.TableArgs,
  isDolt: boolean,
): Promise<t.RawRow> {
  const columns = await query(qh.columnsQuery, [args.tableName]);
  const fkRows = await query(qh.foreignKeysQuery, [
    args.tableName,
    isDolt ? `${args.databaseName}/${args.refName}` : args.databaseName,
  ]);
  const idxRows = await query(qh.indexQuery, [name]);
  return { name: args.tableName, columns, fkRows, idxRows };
}
