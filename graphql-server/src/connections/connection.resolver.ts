import { Resolver } from "@nestjs/graphql";
import { ConnectionOptions } from "mysql2";
import { DataSource } from "typeorm";
import { DataSourceService } from "../dataSources/dataSource.service";

export class WorkbenchConfig {
  hideDoltFeatures: boolean;

  connectionUrl: string;

  useSSL: boolean;
}

@Resolver()
export class ConnectionResolver {
  private ds: DataSource;

  private dss: DataSourceService | undefined;

  private workbenchConfig: WorkbenchConfig | undefined;

  connection(): DataSourceService {
    if (!this.dss) {
      throw new Error("Data source service not initialized");
    }
    return this.dss;
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
    if (this.ds.isInitialized) {
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

    this.dss = new DataSourceService(this.ds);
  }

  getWorkbenchConfig(): WorkbenchConfig | undefined {
    return this.workbenchConfig;
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
