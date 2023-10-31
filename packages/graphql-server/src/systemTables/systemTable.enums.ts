export enum DoltSystemTable {
  DOCS = "dolt_docs",
  QUERY_CATALOG = "dolt_query_catalog",
  SCHEMAS = "dolt_schemas",
  PROCEDURES = "dolt_procedures",
}

export const systemTableValues = Object.values(DoltSystemTable);
