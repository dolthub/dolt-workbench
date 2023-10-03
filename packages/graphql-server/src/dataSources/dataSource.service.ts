import { Injectable } from "@nestjs/common";
import { DataSource, QueryRunner } from "typeorm";
import { RawRows } from "../utils/commonTypes";

export const dbNotFoundErr = "Database connection not found";
export type ParQuery = (q: string, p?: any[] | undefined) => Promise<RawRows>;

@Injectable()
export class DataSourceService {
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

  async query(
    executeQuery: (pq: ParQuery) => any,
    dbName?: string,
  ): Promise<any> {
    return this.handleAsyncQuery(async qr => {
      async function query(q: string, p?: any[] | undefined): Promise<RawRows> {
        const res = await qr.query(q, p);
        return res;
      }

      if (dbName) {
        // Cannot use params here for the database revision. It will incorrectly
        // escape refs with dots
        await qr.query(`USE \`${dbName}\``);
      }

      return executeQuery(query);
    });
  }

  async addDS(connUrl: string) {
    if (this.ds?.isInitialized) {
      await this.ds.destroy();
    }

    this.ds = new DataSource({
      type: "mysql",
      connectorPackage: "mysql2",
      url: connUrl,
      ssl: {
        rejectUnauthorized: false,
      },
      synchronize: false,

      extra: {
        connectionLimit: 6,
        dateStrings: ["DATE"],
        namedPlaceholders: true,
      },
    });

    await this.ds.initialize();
  }
}
