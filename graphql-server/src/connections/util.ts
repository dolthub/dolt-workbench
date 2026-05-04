export function replaceDatabaseInConnectionUrl(
  connectionUrl: string,
  dbName: string,
): string {
  const url = new URL(connectionUrl);
  url.pathname = `/${dbName}`;
  return url.toString();
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
