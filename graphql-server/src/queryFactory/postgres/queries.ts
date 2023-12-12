export const setSearchPath = (dbName: string, _isDolt = false) =>
  `SET SEARCH_PATH = '${dbName}'`;

export const listTablesQuery = `SELECT * FROM pg_catalog.pg_tables where schemaname=$1;`;

export const databasesQuery = `select schema_name
    from information_schema.schemata;`;
