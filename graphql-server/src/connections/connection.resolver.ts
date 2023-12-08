import { Resolver } from "@nestjs/graphql";
import { ConnectionOptions } from "mysql2";
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

  // Used for file upload only
  getMySQLConfig(): ConnectionOptions {
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

    const qf = await this.newQueryFactory(this.ds);
    this.qf = qf;
  }

  getWorkbenchConfig(): WorkbenchConfig | undefined {
    return this.workbenchConfig;
  }

  async newQueryFactory(ds: DataSource): Promise<QueryFactory> {
    try {
      const res = await ds.query("SELECT dolt_version()");
      if (!!res) {
        return new DoltQueryFactory(ds);
      }
      return new MySQLQueryFactory(ds);
    } catch (_) {
      return new MySQLQueryFactory(ds);
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
