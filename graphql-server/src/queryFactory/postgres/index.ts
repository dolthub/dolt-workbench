import { QueryRunner } from "typeorm";
import { QueryFactory } from "..";
import { SchemaType } from "../../schemas/schema.enums";
import { SchemaItem } from "../../schemas/schema.model";
import { TableDetails } from "../../tables/table.model";
import { MySQLQueryFactory } from "../mysql";
import {
  getTableInfo,
  getTablePKColumns,
  getTableRows,
  getTables,
} from "../mysql/utils";
import * as t from "../types";
import * as qh from "./queries";
import { changeSchema, getSchema, tableWithSchema } from "./utils";

export class PostgresQueryFactory
  extends MySQLQueryFactory
  implements QueryFactory
{
  isDolt = false;

  async databases(): Promise<string[]> {
    const res: t.RawRows = await this.query(qh.databasesQuery, []);
    return res
      .map(r => r.datname)
      .filter(
        d =>
          d !== "template0" &&
          d !== "template1" &&
          d !== "dolt_cluster" &&
          !d.includes("/"),
      );
  }

  async schemas(args: t.RefArgs): Promise<string[]> {
    const res: t.RawRows = await this.query(
      qh.schemasQuery,
      [
        args.refName && this.isDolt
          ? `${args.databaseName}/${args.refName}`
          : args.databaseName,
      ],
      args.databaseName,
      args.refName,
    );
    return res.filter(s => s.schema_name !== "dolt").map(r => r.schema_name);
  }

  async createSchema(args: t.RefSchemaArgs): Promise<void> {
    return this.queryQR(
      async qr => qr.createSchema(args.schemaName),
      args.databaseName,
      args.refName,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  async checkoutDatabase(qr: QueryRunner, dbName: string): Promise<void> {
    const currentDb = await qr.getCurrentDatabase();
    if (dbName !== currentDb) {
      throw new Error("Databases do not match");
    }
  }

  async getTableNames(args: t.RefMaybeSchemaArgs): Promise<string[]> {
    return this.queryQR(
      async qr => {
        const schema = await getSchema(qr, args);
        const res: t.RawRows = await qr.query(qh.listTablesQuery, [schema]);
        return res.map(r => r.tablename);
      },
      args.databaseName,
      args.refName,
    );
  }

  async getTableInfo(
    args: t.TableMaybeSchemaArgs,
  ): Promise<TableDetails | undefined> {
    return this.queryQR(
      async qr => {
        const schema = await getSchema(qr, args);
        return getTableInfo(qr, `${schema}.${args.tableName}`);
      },
      args.databaseName,
      args.refName,
    );
  }

  async getTables(
    args: t.RefMaybeSchemaArgs,
    tns: string[],
  ): Promise<TableDetails[]> {
    return this.queryQR(
      async qr => {
        const schema = await getSchema(qr, args);
        const names = tns.map(tn =>
          tableWithSchema({ tableName: tn, schemaName: schema }),
        );
        return getTables(qr, names);
      },
      args.databaseName,
      args.refName,
    );
  }

  async getTablePKColumns(args: t.TableMaybeSchemaArgs): Promise<string[]> {
    return this.queryQR(
      async qr => {
        const schemaName = await getSchema(qr, args);
        return getTablePKColumns(qr, tableWithSchema({ ...args, schemaName }));
      },
      args.databaseName,
      args.refName,
    );
  }

  async getTableRows(
    args: t.TableMaybeSchemaArgs,
    page: t.TableRowPagination,
  ): t.PR {
    return this.queryQR(
      async qr => {
        const schemaName = await getSchema(qr, args);
        return getTableRows(
          qr.manager,
          tableWithSchema({ ...args, schemaName }),
          page,
        );
      },
      args.databaseName,
      args.refName,
    );
  }

  async getSqlSelect(
    args: t.RefMaybeSchemaArgs & { queryString: string },
  ): Promise<{ rows: t.RawRows; warnings: string[] }> {
    return this.queryQR(
      async qr => {
        if (args.schemaName) {
          await changeSchema(qr, args.schemaName);
        }
        return qr.query(args.queryString, []);
      },
      args.databaseName,
      args.refName,
    );
  }

  async getSchemas(
    args: t.RefMaybeSchemaArgs,
    type?: SchemaType,
  ): Promise<SchemaItem[]> {
    return this.queryQR(async qr => {
      const schema = await getSchema(qr, args);

      const vRes = await qr.query(qh.getViewsQuery, [schema]);
      const views = vRes.map(v => {
        return { name: v.table_name, type: SchemaType.View };
      });
      if (type === SchemaType.View) {
        return views;
      }
      const tRes = await qr.query(qh.getTriggersQuery, [schema]);
      const triggers = tRes.map(tr => {
        return { name: tr.trigger_name, type: SchemaType.Trigger };
      });

      const eRes = await qr.query(qh.getEventsQuery);
      const events = eRes.map(e => {
        return { name: e.evtname, type: SchemaType.Event };
      });
      return [...views, ...triggers, ...events];
    }, args.databaseName);
  }

  async getProcedures(args: t.DBArgs): Promise<SchemaItem[]> {
    const res: t.RawRows = await this.query(
      qh.getProceduresQuery,
      [args.databaseName],
      args.databaseName,
    );
    return res.map(r => {
      return { name: r.proname, type: SchemaType.Procedure };
    });
  }
}
