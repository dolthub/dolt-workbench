import { escapeStringLiteral } from "../build/buildUtils";

// Temp objects and attached databases exist only on the connection that
// created them.
export const connectionLocalObjectsQuery = `SELECT (SELECT count(*) FROM temp.sqlite_master) + (SELECT count(*) FROM pragma_database_list WHERE name NOT IN ('main', 'temp')) AS n`;

export const listTablesQuery = `SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name`;

export const viewsQuery = `SELECT name FROM sqlite_master WHERE type = 'view' ORDER BY name`;

export const triggersQuery = `SELECT name FROM sqlite_master WHERE type = 'trigger' ORDER BY name`;

export const tableColumnsQuery = `SELECT name, type, "notnull", pk FROM pragma_table_info(?) ORDER BY cid`;

export function schemaDefinitionQuery(name: string, kind: string): string {
  return `SELECT sql FROM sqlite_master WHERE name = ${escapeStringLiteral(name)} AND type = ${escapeStringLiteral(kind)}`;
}
