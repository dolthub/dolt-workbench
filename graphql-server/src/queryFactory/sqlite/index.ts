import { QueryRunner } from "typeorm";
import { QueryFactory } from "..";
import { dbNameFromFilePath } from "../../connections/util";
import { MySQLQueryFactory } from "../mysql";
import * as t from "../types";

export class SqliteQueryFactory
  extends MySQLQueryFactory
  implements QueryFactory
{
  isDolt = false;

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
}
