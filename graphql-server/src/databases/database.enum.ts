import { registerEnumType } from "@nestjs/graphql";

export enum DatabaseType {
  Mysql = "mysql",
  Postgres = "postgres",
}

registerEnumType(DatabaseType, { name: "DatabaseType" });
