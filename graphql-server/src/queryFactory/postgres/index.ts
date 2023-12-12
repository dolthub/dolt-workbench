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

  async getSchemas(args: t.DBArgs, _type?: SchemaType): t.UPR {
    // TODO: schemas
    return this.queryMultiple(async _query => [], args.databaseName);
  }

  async getProcedures(args: t.DBArgs): t.UPR {
    // TODO: procedures
    return this.query("", [args.databaseName], args.databaseName);
  }
}
