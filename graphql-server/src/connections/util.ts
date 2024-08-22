export function replaceDatabaseInConnectionUrl(
  connectionUrl: string,
  dbName: string,
): string {
  const url = new URL(connectionUrl);
  url.pathname = `/${dbName}`;
  return url.toString();
}
