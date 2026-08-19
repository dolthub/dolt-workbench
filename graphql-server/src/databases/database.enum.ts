import { registerEnumType } from "@nestjs/graphql";

export enum DatabaseType {
  Mysql = "mysql",
  Postgres = "postgres",
  Sqlite = "sqlite",
}

registerEnumType(DatabaseType, { name: "DatabaseType" });
