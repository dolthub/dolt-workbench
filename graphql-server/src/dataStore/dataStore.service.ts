import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DataSource, DataSourceOptions, Repository } from "typeorm";
import { DatabaseConnection } from "../databases/database.model";
import { DatabaseConnectionsEntity } from "./databaseConnection.entity";

@Injectable()
export class DataStoreService {
  private ds: DataSource | undefined;

  constructor(private configService: ConfigService) {}

  hasDataStoreConfig(): boolean {
    const host = this.configService.get<string | undefined>("DW_DB_HOST");
    const uri = this.configService.get<string | undefined>(
      "DW_DB_CONNECTION_URI",
    );
    return !!(host || uri);
  }

  getEnvConfig(): DataSourceOptions {
    if (!this.hasDataStoreConfig()) {
      throw new Error("Data store config not found");
    }
    return {
      type: "mysql",
      connectorPackage: "mysql2",
      url: this.configService.get<string | undefined>("DW_DB_CONNECTION_URI"),
      host: this.configService.get<string | undefined>("DW_DB_HOST"),
      port: this.configService.get<number | undefined>("DW_DB_PORT"),
      username: this.configService.get<string | undefined>("DW_DB_USER"),
      password: this.configService.get<string | undefined>("DW_DB_PASS"),
      database: this.configService.get<string | undefined>("DW_DB_DBNAME"),
      entities: [DatabaseConnectionsEntity],
      synchronize: true,
      logging: "all",
    };
  }

  async connection(): Promise<DataSource> {
    if (!this.ds) {
      const config = this.getEnvConfig();
      this.ds = new DataSource(config);
      await this.ds.initialize();
    }
    return this.ds;
  }

  async getConnRepo(): Promise<Repository<DatabaseConnectionsEntity>> {
    const conn = await this.connection();
    return conn.getRepository(DatabaseConnectionsEntity);
  }

  async getStoredConnections(): Promise<DatabaseConnection[]> {
    const repo = await this.getConnRepo();
    const conns = await repo.find();
    return conns;
  }

  async addStoredConnection(item: DatabaseConnection): Promise<void> {
    const repo = await this.getConnRepo();
    const existing = await repo.findOneBy({ name: item.name });

    if (existing) {
      if (existing.connectionUrl === item.connectionUrl) return undefined;
      throw new Error("name already exists");
    }

    await repo.save(item);
    return undefined;
  }

  async removeStoredConnection(name: string): Promise<void> {
    const repo = await this.getConnRepo();
    await repo.delete({ name });
  }
}
