import { QueryRunner } from "typeorm";
import { QueryFactory } from "..";
import { SchemaType } from "../../schemas/schema.enums";
import { SchemaItem } from "../../schemas/schema.model";
import { TableDetails } from "../../tables/table.model";
import { MySQLQueryFactory } from "../mysql";
import { convertToTableDetails } from "../mysql/utils";
import * as t from "../types";
import * as qh from "./queries";

export class PostgresQueryFactory
  extends MySQLQueryFactory
  implements QueryFactory
{
  isDolt = false;

  async databases(): Promise<string[]> {
    // return this.queryQR(async qr => qr());
    const res: t.RawRows = await this.query(qh.databasesQuery, []);
    return res.map(r => r.datname);
  }

  async schemas(args: t.DBArgs): Promise<string[]> {
    const res: t.RawRows = await this.query(qh.schemasQuery, [
      args.databaseName,
    ]);
    return res.map(r => r.schema_name);
  }

  async createSchema(args: t.SchemaArgs): Promise<void> {
    return this.handleAsyncQuery(async qr => qr.createSchema(args.schemaName));
  }

  async checkoutDatabase(qr: QueryRunner, dbName: string): Promise<void> {
    await qr.query(qh.setSearchPath(dbName, this.isDolt));
  }

  async getTableNames(args: t.RefArgs): Promise<string[]> {
    const res: t.RawRows = await this.query(
      qh.listTablesQuery,
      [args.databaseName],
      args.databaseName,
    );
    return res.map(r => r.tablename);
  }

  async getTableInfo(args: t.TableArgs): Promise<TableDetails | undefined> {
    return this.queryQR(async qr => {
      const table = await qr.getTable(`${args.databaseName}.${args.tableName}`);
      if (!table) return undefined;
      return convertToTableDetails(table);
    }, args.databaseName);
  }

  async getTables(args: t.RefArgs, tns: string[]): Promise<TableDetails[]> {
    const names = tns.map(tn => `${args.databaseName}.${tn}`);
    return this.queryQR(async qr => {
      const tables = await qr.getTables(names);
      return tables.map(convertToTableDetails);
    }, args.databaseName);
  }

  async getSchemas(args: t.DBArgs, type?: SchemaType): Promise<SchemaItem[]> {
    return this.queryMultiple(async query => {
      const vRes = await query(qh.getViewsQuery, [args.databaseName]);
      const views = vRes.map(v => {
        return { name: v.table_name, type: SchemaType.View };
      });
      if (type === SchemaType.View) {
        return views;
      }
      const tRes = await query(qh.getTriggersQuery, [args.databaseName]);
      const triggers = tRes.map(tr => {
        return { name: tr.trigger_name, type: SchemaType.Trigger };
      });

      const eRes = await query(qh.getEventsQuery);
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
