import { Injectable } from "@nestjs/common";
import { DataSource, QueryRunner } from "typeorm";
import { RawRows } from "../utils/commonTypes";

export const dbNotFoundErr = "Database connection not found";
export type ParQuery = (q: string, p?: any[] | undefined) => Promise<RawRows>;

@Injectable()
export class DataSourceService {
  private isDolt: boolean | undefined;

  constructor(private ds: DataSource | undefined) {}

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
  ): Promise<RawRows> {
    const qr = this.getQR();
    try {
      await qr.connect();
      const res = await work(qr);
      return res;
    } finally {
      await qr.release();
    }
  }

  // Assumes Dolt database
  async query(
    executeQuery: (pq: ParQuery) => any,
    dbName?: string,
    refName?: string,
  ): Promise<any> {
    return this.handleAsyncQuery(async qr => {
      async function query(q: string, p?: any[] | undefined): Promise<RawRows> {
        const res = await qr.query(q, p);
        return res;
      }

      if (dbName) {
        await qr.query(useDBStatement(dbName, refName));
      }

      return executeQuery(query);
    });
  }

  async getIsDolt(qr: QueryRunner): Promise<boolean> {
    if (this.isDolt !== undefined) {
      return this.isDolt;
    }
    try {
      const res = await qr.query("SELECT dolt_version()");
      this.isDolt = !!res;
      return !!res;
    } catch (_) {
      this.isDolt = false;
      return false;
    }
  }

  // Queries that will work on both MySQL and Dolt
  async queryMaybeDolt(
    executeQuery: (pq: ParQuery, isDolt: boolean) => any,
    dbName?: string,
    refName?: string,
  ): Promise<any> {
    return this.handleAsyncQuery(async qr => {
      async function query(q: string, p?: any[] | undefined): Promise<RawRows> {
        const res = await qr.query(q, p);
        return res;
      }

      const isDolt = await this.getIsDolt(qr);
      if (dbName) {
        await qr.query(useDBStatement(dbName, refName, isDolt));
      }

      return executeQuery(query, isDolt);
    });
  }
}

// Cannot use params here for the database revision. It will incorrectly
// escape refs with dots
export function useDBStatement(
  dbName?: string,
  refName?: string,
  isDolt = true,
): string {
  if (refName && isDolt) {
    return `USE \`${dbName}/${refName}\``;
  }
  return `USE \`${dbName}\``;
}
