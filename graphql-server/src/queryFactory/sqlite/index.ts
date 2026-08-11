import { QueryRunner } from "typeorm";
import { QueryFactory } from "..";
import { dbNameFromFilePath } from "../../connections/util";
import { SchemaType } from "../../schemas/schema.enums";
import { SchemaItem } from "../../schemas/schema.model";
import { TableDetails } from "../../tables/table.model";
import { MySQLQueryFactory } from "../mysql";
import { getTableInfo, getTablePKColumns, getTables } from "../mysql/utils";
import * as t from "../types";
import { classifySqliteResult } from "./classifyResult";
import * as qh from "./queries";

export class SqliteQueryFactory
  extends MySQLQueryFactory
  implements QueryFactory
{
  isDolt = false;

  private queue: Promise<unknown> = Promise.resolve();

  async handleAsyncQuery<T>(work: (qr: QueryRunner) => Promise<T>): Promise<T> {
    const run = async () => super.handleAsyncQuery(work);
    const res = this.queue.then(run, run);
    this.queue = res.then(
      () => undefined,
      () => undefined,
    );
    return res;
  }

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

  // The MySQL implementations of these drop refName; it must reach
  // checkoutDatabase so DoltLite can scope introspection to a branch.
  async getTableInfo(args: t.TableArgs): Promise<TableDetails | undefined> {
    return this.queryQR(
      async qr => {
        const table = await getTableInfo(qr, args.tableName);
        if (table) return table;
        // TypeORM's sqlite getTable only reads tables; views are
        // introspected through pragma_table_info instead.
        const cols: t.RawRows = await qr.query(qh.tableColumnsQuery, [
          args.tableName,
        ]);
        if (!cols.length) return undefined;
        return {
          tableName: args.tableName,
          columns: cols.map(c => {
            return {
              name: c.name,
              isPrimaryKey: c.pk > 0,
              type: c.type,
              constraints: [{ notNull: c.notnull === 1 }],
              sourceTable: args.tableName,
            };
          }),
          foreignKeys: [],
          indexes: [],
        };
      },
      args.databaseName,
      args.refName,
    );
  }

  async getTables(args: t.RefArgs, tns: string[]): Promise<TableDetails[]> {
    return this.queryQR(
      async qr => getTables(qr, tns),
      args.databaseName,
      args.refName,
    );
  }

  async getTablePKColumns(args: t.TableArgs): Promise<string[]> {
    return this.queryQR(
      async qr => getTablePKColumns(qr, args.tableName),
      args.databaseName,
      args.refName,
    );
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

  async getSchemas(
    args: t.RefMaybeSchemaArgs,
    type?: SchemaType,
  ): Promise<SchemaItem[]> {
    return this.queryMultiple(
      async query => {
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
      },
      args.databaseName,
      args.refName,
    );
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
