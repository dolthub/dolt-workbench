import { QueryRunner } from "typeorm";
import { QueryFactory } from "..";
import { dbNameFromFilePath } from "../../connections/util";
import { SchemaType } from "../../schemas/schema.enums";
import { SchemaItem } from "../../schemas/schema.model";
import { MySQLQueryFactory } from "../mysql";
import * as t from "../types";
import { classifySqliteResult } from "./classifyResult";
import * as qh from "./queries";

export class SqliteQueryFactory
  extends MySQLQueryFactory
  implements QueryFactory
{
  isDolt = false;

  private queue: Promise<unknown> = Promise.resolve();

  // The better-sqlite3 driver family shares one connection and a singleton
  // QueryRunner, so logical units (e.g. a branch checkout plus its queries)
  // from interleaved resolvers must not overlap.
  async handleAsyncQuery<T>(work: (qr: QueryRunner) => Promise<T>): Promise<T> {
    const run = async () => super.handleAsyncQuery(work);
    const res = this.queue.then(run, run);
    this.queue = res.then(
      () => undefined,
      () => undefined,
    );
    return res;
  }

  // Single-file database: there is no `USE` statement in SQLite.
  async checkoutDatabase(
    _qr: QueryRunner,
    _dbName: string,
    _refName?: string,
  ): Promise<void> {}

  getDatabaseName(): string {
    const file = this.getDS().options.database;
    return dbNameFromFilePath(String(file));
  }

  async databases(): Promise<string[]> {
    return [this.getDatabaseName()];
  }

  async currentDatabase(): Promise<string | undefined> {
    return this.getDatabaseName();
  }

  // The inherited qr.createDatabase() is a silent no-op for the sqlite driver
  // family, which would falsely report success.
  async createDatabase(_args: t.DBArgs): Promise<void> {
    throw new Error("Cannot create a database on a SQLite connection");
  }

  async getTableNames(args: t.RefArgs): Promise<string[]> {
    const res: t.RawRows = await this.query(
      qh.listTablesQuery,
      [],
      args.databaseName,
      args.refName,
    );
    return res.map(r => r.name);
  }

  async getSqlSelect(
    args: t.RefArgs & { queryString: string },
  ): Promise<t.SqlSelectResult> {
    return this.queryQR(
      async qr => {
        const result = await qr.query(args.queryString, [], true);
        return { ...classifySqliteResult(result), warnings: [] };
      },
      args.databaseName,
      args.refName,
    );
  }

  async getSchemas(args: t.DBArgs, type?: SchemaType): Promise<SchemaItem[]> {
    return this.queryMultiple(async query => {
      const vRes = await query(qh.viewsQuery);
      const views = vRes.map(v => {
        return { name: v.name, type: SchemaType.View };
      });
      if (type === SchemaType.View) {
        return views;
      }

      const tRes = await query(qh.triggersQuery);
      const triggers = tRes.map(tr => {
        return { name: tr.name, type: SchemaType.Trigger };
      });

      return [...views, ...triggers];
    }, args.databaseName);
  }

  async getProcedures(_args: t.DBArgs): Promise<SchemaItem[]> {
    return [];
  }

  async callProcedure(_args: t.CallProcedureArgs): Promise<t.MutationResult> {
    throw new Error("Stored procedures are not supported for SQLite databases");
  }

  async schemaDefinition(
    args: t.SchemaDefinitionArgs,
  ): Promise<t.SqlSelectResult> {
    return this.queryQR(
      async qr => {
        const sql = qh.schemaDefinitionQuery(args.name, args.kind);
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
}
