// Cannot use params here for the database revision. It will incorrectly
// escape refs with dots
export function useDB(dbName: string, refName?: string, isDolt = true): string {
  if (refName && isDolt) {
    return `USE \`${dbName}/${refName}\``;
  }
  return `USE \`${dbName}\``;
}

export const databasesQuery = `SHOW DATABASES`;

export const listTablesQuery = `SHOW FULL TABLES WHERE table_type = 'BASE TABLE'`;

export const getViewsQuery = `SELECT TABLE_SCHEMA, TABLE_NAME 
FROM information_schema.tables 
WHERE TABLE_TYPE = 'VIEW' AND TABLE_SCHEMA = ?`;

export const getTriggersQuery = `SHOW TRIGGERS`;

export const getEventsQuery = `SHOW EVENTS`;

export const proceduresQuery = `SHOW PROCEDURE STATUS WHERE type = "PROCEDURE" AND db = ?`;

export const showWarningsQuery = `SHOW WARNINGS`;
