import { Injectable } from "@nestjs/common";
import * as mysql from "mysql2/promise";
import { DataSource } from "typeorm";
import { DatabaseType } from "../databases/database.enum";
import { QueryFactory } from "../queryFactory";
import { DoltQueryFactory } from "../queryFactory/dolt";
import { MySQLQueryFactory } from "../queryFactory/mysql";
import { PostgresQueryFactory } from "../queryFactory/postgres";

export class WorkbenchConfig {
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

  connection(): QueryFactory {
    if (!this.qf) {
      throw new Error("Data source service not initialized");
    }
    return this.qf;
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

  async addConnection(config: WorkbenchConfig): Promise<void> {
    if (this.ds?.isInitialized) {
      await this.ds.destroy();
    }

    this.workbenchConfig = config;

    this.ds = new DataSource({
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

    await this.ds.initialize();

    const qf = await this.newQueryFactory(config.type);
    this.qf = qf;
  }

  getWorkbenchConfig(): WorkbenchConfig | undefined {
    return this.workbenchConfig;
  }

  async newQueryFactory(type: DatabaseType): Promise<QueryFactory> {
    if (type === DatabaseType.Postgres) {
      return new PostgresQueryFactory(this.ds);
    }
    try {
      const res = await this.ds?.query("SELECT dolt_version()");
      if (res) {
        return new DoltQueryFactory(this.ds);
      }
      return new MySQLQueryFactory(this.ds);
    } catch (_) {
      return new MySQLQueryFactory(this.ds);
    }
  }

  async resetDS(): Promise<void> {
    if (!this.workbenchConfig) {
      throw new Error(
        "Workbench config not found. Please add connectivity information.",
      );
    }
    await this.addConnection(this.workbenchConfig);
  }
}
