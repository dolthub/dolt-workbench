import { Injectable } from "@nestjs/common";
import * as mysql from "mysql2/promise";
import { DataSource, QueryRunner } from "typeorm";
import { RawRows } from "../utils/commonTypes";

export const dbNotFoundErr = "Database connection not found";
export type ParQuery = (q: string, p?: any[] | undefined) => Promise<RawRows>;

class WorkbenchConfig {
  hideDoltFeatures: boolean;

  connectionUrl: string;

  useSSL: boolean;

  isDolt?: boolean;
}

@Injectable()
export class DataSourceService {
  constructor(
    private ds: DataSource | undefined,
    private workbenchConfig: WorkbenchConfig | undefined,
  ) {}

  getDS(): DataSource {
    const { ds } = this;
    if (!ds) throw new Error(dbNotFoundErr);
    return ds;
  }

  // Used for file upload only
  getMySQLConfig(): mysql.ConnectionOptions {
    const { workbenchConfig } = this;
    if (!workbenchConfig) {
      throw new Error("Workbench config not found for MySQL connection");
    }

    return {
      uri: workbenchConfig.connectionUrl,
      ssl: {
        rejectUnauthorized: false,
      },
      connectionLimit: 1,
      dateStrings: ["DATE"],

      // Allows file upload via LOAD DATA
      flags: ["+LOCAL_FILES"],
    };
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
    const { workbenchConfig } = this;
    if (!workbenchConfig) {
      throw new Error("Workbench config not found. Restart database.");
    }

    if (workbenchConfig.isDolt !== undefined) {
      return workbenchConfig.isDolt;
    }
    try {
      const res = await qr.query("SELECT dolt_version()");
      workbenchConfig.isDolt = !!res;
      return !!res;
    } catch (_) {
      workbenchConfig.isDolt = false;
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

  getWorkbenchConfig(): WorkbenchConfig | undefined {
    return this.workbenchConfig;
  }

  async addDS(config: WorkbenchConfig) {
    if (this.ds?.isInitialized) {
      await this.ds.destroy();
    }

    this.workbenchConfig = config;

    this.ds = new DataSource({
      type: "mysql",
      connectorPackage: "mysql2",
      url: config.connectionUrl,
      ssl: config.useSSL
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
      synchronize: false,
      logging: "all",

      extra: {
        connectionLimit: 6,
        dateStrings: ["DATE"],
        namedPlaceholders: true,
      },
    });

    await this.ds.initialize();
  }

  async resetDS() {
    if (!this.workbenchConfig) {
      throw new Error(
        "Workbench config not found. Please add connectivity information.",
      );
    }
    await this.addDS(this.workbenchConfig);
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
