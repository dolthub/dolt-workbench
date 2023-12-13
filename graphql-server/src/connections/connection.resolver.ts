import { Resolver } from "@nestjs/graphql";
import * as mysql from "mysql2/promise";
import { DataSource } from "typeorm";
import { DoltQueryFactory } from "../queryFactory/dolt";
import { MySQLQueryFactory } from "../queryFactory/mysql";
import { QueryFactory } from "../queryFactory/types";

export class WorkbenchConfig {
  hideDoltFeatures: boolean;

  connectionUrl: string;

  useSSL: boolean;
}

@Resolver()
export class ConnectionResolver {
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
      ssl: {
        rejectUnauthorized: false,
      },
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

    const qf = await this.newQueryFactory();
    this.qf = qf;
  }

  getWorkbenchConfig(): WorkbenchConfig | undefined {
    return this.workbenchConfig;
  }

  async newQueryFactory(): Promise<QueryFactory> {
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
