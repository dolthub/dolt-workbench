import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

export const dbNotFoundErr = "Database connection not found";

@Injectable()
export class DataSourceService {
  constructor(private ds: DataSource | undefined) {}

  getDS(): DataSource {
    const { ds } = this;
    if (!ds) throw new Error(dbNotFoundErr);
    return ds;
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
