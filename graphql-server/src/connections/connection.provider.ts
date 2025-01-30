import { Injectable } from "@nestjs/common";
import * as mysql from "mysql2/promise";
import { DataSource } from "typeorm";
import { DatabaseType } from "../databases/database.enum";
import { QueryFactory } from "../queryFactory";
import { DoltQueryFactory } from "../queryFactory/dolt";
import { DoltgresQueryFactory } from "../queryFactory/doltgres";
import { MySQLQueryFactory } from "../queryFactory/mysql";
import { PostgresQueryFactory } from "../queryFactory/postgres";
import { replaceDatabaseInConnectionUrl } from "./util";

export class WorkbenchConfig {
  name: string;

  hideDoltFeatures: boolean;

  connectionUrl: string;

  useSSL: boolean;

  type: DatabaseType;

  schema?: string; // Postgres only
}

@Injectable()
export class ConnectionProvider {
  private ds: DataSource | undefined;

  private qf: QueryFactory | undefined;

  private workbenchConfig: WorkbenchConfig | undefined;

  databases: Record<
    string,
    { ds: DataSource; qf: QueryFactory; config: WorkbenchConfig }
  > = {};

  connection(name: string): QueryFactory {
    if (!(name in this.databases)) {
      throw new Error("Connection not found");
    }
    if (!this.databases[name].qf) {
      throw new Error("Data source service not initialized");
    }
    return this.databases[name].qf;
  }

  // Used for file upload only, must destroy after using
  async mysqlConnection(): Promise<mysql.Connection> {
    const { workbenchConfig } = this;
    if (!workbenchConfig) {
      throw new Error("Workbench config not found for MySQL connection");
    }

    const options: mysql.ConnectionOptions = {
      uri: workbenchConfig.connectionUrl,
      ssl: workbenchConfig.useSSL
        ? {
            rejectUnauthorized: false,
          }
        : undefined,
      connectionLimit: 1,
      dateStrings: ["DATE"],

      // Allows file upload via LOAD DATA
      flags: ["+LOCAL_FILES"],
    };

    return mysql.createConnection(options);
  }

  async addConnection(config: WorkbenchConfig): Promise<{ isDolt: boolean }> {
    console.log("addconnection");
    const name = config.name;
    if (name in this.databases) {
      if (this.databases[name].ds.isInitialized) {
        await this.databases[name].ds.destroy();
      }
    }
    const ds = getDataSource(config);
    try {
      await ds.initialize();
      await this.ds?.initialize();
    } catch (err) {
      // Don't store database if error initializing
      delete this.databases[name];
      throw new Error(`Error starting new connection: ${err.message}`);
    }

    const res = await newQueryFactory(config.type, ds);
    const qf = res.qf;

    const cdb = await qf.currentDatabase();
    console.log("cdb", cdb);
    this.databases[name] = { ds, config, qf };
    return { isDolt: res.isDolt };
  }

  getWorkbenchConfig(): WorkbenchConfig | undefined {
    return this.workbenchConfig;
  }

  getIsDolt(): boolean | undefined {
    return this.qf?.isDolt;
  }

  async resetDS(newDatabase?: string): Promise<void> {
    if (!this.workbenchConfig) {
      throw new Error(
        "Workbench config not found. Please add connectivity information.",
      );
    }
    await this.addConnection({
      ...this.workbenchConfig,
      connectionUrl: newDatabase
        ? replaceDatabaseInConnectionUrl(
            this.workbenchConfig.connectionUrl,
            newDatabase,
          )
        : this.workbenchConfig.connectionUrl,
    });
  }
}

export function getDataSource(config: WorkbenchConfig): DataSource {
  const ds = new DataSource({
    name: config.name,
    applicationName: "Dolt Workbench",
    type: config.type,
    connectorPackage: config.type === "mysql" ? "mysql2" : undefined,
    url: config.connectionUrl,
    schema: config.schema,
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
  return ds;
}

export async function newQueryFactory(
  type: DatabaseType,
  ds?: DataSource,
): Promise<{ qf: QueryFactory; isDolt: boolean }> {
  if (type === DatabaseType.Postgres) {
    try {
      const res = await ds?.query("SELECT dolt_version()");
      if (res) {
        return { qf: new DoltgresQueryFactory(ds), isDolt: true };
      }
    } catch (_) {
      // do nothing
    }
    return { qf: new PostgresQueryFactory(ds), isDolt: false };
  }

  try {
    const res = await ds?.query("SELECT dolt_version()");
    if (res) {
      return { qf: new DoltQueryFactory(ds), isDolt: true };
    }
  } catch (_) {
    // do nothing
  }
  return { qf: new MySQLQueryFactory(ds), isDolt: false };
}
