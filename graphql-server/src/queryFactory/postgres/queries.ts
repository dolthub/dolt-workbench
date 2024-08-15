export const setSearchPath = (schemaName: string) => {
  return `SET SEARCH_PATH = '${schemaName}'`;
};

export const databasesQuery = `SELECT datname FROM pg_database`;

export const schemasQuery = `SELECT schema_name FROM information_schema.schemata WHERE catalog_name = $1`;

export const listTablesQuery = `SELECT * FROM pg_catalog.pg_tables where schemaname=$1;`;

export const getViewsQuery = `SELECT table_name FROM INFORMATION_SCHEMA.views WHERE table_schema = $1`;

export const getTriggersQuery = `SELECT trigger_name         
FROM information_schema.triggers  
where trigger_schema = $1`;

export const getEventsQuery = `select evtname from pg_event_trigger`;

export const getProceduresQuery = `SELECT proname 
FROM pg_catalog.pg_namespace  
JOIN pg_catalog.pg_proc  
ON pronamespace = pg_namespace.oid 
WHERE nspname = $1
`;
