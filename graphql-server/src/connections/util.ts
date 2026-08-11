export function replaceDatabaseInConnectionUrl(
  connectionUrl: string,
  dbName: string,
): string {
  const url = new URL(connectionUrl);
  url.pathname = `/${dbName}`;
  return url.toString();
}

export function getSqliteFilePath(connectionUrl: string): string {
  const url = new URL(connectionUrl);
  try {
    return decodeURIComponent(url.pathname);
  } catch {
    return url.pathname;
  }
}

export function dbNameFromFilePath(filePath: string): string {
  const base = filePath.split(/[\\/]/).pop() ?? filePath;
  const name = base.replace(/\.[^.]+$/, "");
  return name || base;
}

export function getSqliteDbName(connectionUrl: string): string {
  return dbNameFromFilePath(getSqliteFilePath(connectionUrl));
}

export type ParsedConnectionUrl = {
  host?: string;
  user?: string;
  password?: string;
};

export function parseConnectionUrl(connectionUrl: string): ParsedConnectionUrl {
  try {
    const url = new URL(connectionUrl);
    return {
      host: url.hostname || undefined,
      user: url.username ? decodeURIComponent(url.username) : undefined,
      password: url.password ? decodeURIComponent(url.password) : undefined,
    };
  } catch {
    return {};
  }
}
