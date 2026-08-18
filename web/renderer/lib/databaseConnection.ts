import { DatabaseConnectionFragment, DatabaseType } from "@gen/graphql-types";

type DisplayableConnection = Pick<DatabaseConnectionFragment, "name" | "type">;

export function isSqliteConnection(conn: DisplayableConnection): boolean {
  return conn.type === DatabaseType.Sqlite;
}

export function getConnectionDisplayName(conn: DisplayableConnection): string {
  if (!isSqliteConnection(conn)) return conn.name;

  const base = conn.name.split(/[\\/]/).pop() ?? conn.name;
  const name = base.replace(/\.[^.]+$/, "");
  return name || base;
}
