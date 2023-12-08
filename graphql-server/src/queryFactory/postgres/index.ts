import { QueryRunner } from "typeorm";
import { QueryFactory } from "..";
import { MySQLQueryFactory } from "../mysql";
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
}
