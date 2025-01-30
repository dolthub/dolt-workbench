import { DataSource, QueryRunner } from "typeorm";
import * as t from "./types";

export const dbNotFoundErr = "Database connection not found";

export class BaseQueryFactory {
  ds: DataSource | undefined;

  constructor(ds: DataSource | undefined) {
    this.ds = ds;
  }

  getDS(): DataSource {
    const { ds } = this;
    if (!ds) throw new Error(dbNotFoundErr);
    return ds;
  }

  getQR(): QueryRunner {
    return this.getDS().createQueryRunner();
  }

  async handleAsyncQuery<T>(work: (qr: QueryRunner) => Promise<T>): Promise<T> {
    const qr = this.getQR();
    try {
      await qr.connect();
      const res = await work(qr);
      return res;
    } finally {
      await qr.release();
    }
  }

  async currentDatabase(): Promise<string | undefined> {
    return this.handleAsyncQuery(async qr => {
      return qr.getCurrentDatabase();
    });
  }

  async createDatabase(args: t.DBArgs): Promise<void> {
    return this.handleAsyncQuery(async qr =>
      qr.createDatabase(args.databaseName),
    );
  }
}
