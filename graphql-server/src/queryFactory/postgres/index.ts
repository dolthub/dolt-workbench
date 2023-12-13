import { QueryRunner } from "typeorm";
import { QueryFactory } from "..";
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
    const res: t.RawRows = await this.query(qh.databasesQuery, []);
    return res.map(r => r.schema_name);
  }

  async checkoutDatabase(qr: QueryRunner, dbName: string): Promise<void> {
    await qr.query(qh.setSearchPath(dbName));
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

  async getSchemas(args: t.DBArgs, type?: SchemaType): t.UPR {
    return this.queryMultiple(async query => {
      // const vRes = await query(qh.getViewsQuery, [args.databaseName]);
      // const views = vRes.map(v => {
      //   return { name: v.TABLE_NAME, type: SchemaType.View };
      // });
      // if (type === SchemaType.View) {
      //   return views;
      // }

      // const tRes = await query(qh.getTriggersQuery);
      // const triggers = tRes.map(tr => {
      //   return { name: tr.Trigger, type: SchemaType.Trigger };
      // });

      // const eRes = await query(qh.getEventsQuery);
      // const events = eRes.map(e => {
      //   return { name: e.Name, type: SchemaType.Event };
      // });

      // return [...views, ...triggers, ...events];
      return [];
    }, args.databaseName);
  }

  async getProcedures(args: t.DBArgs): t.UPR {
    // return this.query(
    //   qh.proceduresQuery,
    //   [args.databaseName],
    //   args.databaseName,
    // );
    return [];
  }
}
