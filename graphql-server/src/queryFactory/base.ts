import { DataSource, QueryRunner } from "typeorm";
import { dbNotFoundErr } from "../dataSources/dataSource.service";
import * as t from "./types";

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

  async handleAsyncQuery(
    work: (qr: QueryRunner) => Promise<any>,
  ): Promise<any> {
    const qr = this.getQR();
    try {
      await qr.connect();
      const res = await work(qr);
      return res;
    } finally {
      await qr.release();
    }
  }

  async currentDatabase(): Promise<string> {
    return this.handleAsyncQuery(async qr => qr.getCurrentDatabase());
  }

  async createDatabase(args: t.DBArgs): t.PR {
    return this.handleAsyncQuery(async qr =>
      qr.createDatabase(args.databaseName),
    );
  }
}
