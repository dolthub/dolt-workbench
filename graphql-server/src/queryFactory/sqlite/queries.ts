import { escapeStringLiteral } from "../build/buildUtils";

export const listTablesQuery = `SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name`;

export const viewsQuery = `SELECT name FROM sqlite_master WHERE type = 'view' ORDER BY name`;

export const triggersQuery = `SELECT name FROM sqlite_master WHERE type = 'trigger' ORDER BY name`;

export const tableColumnsQuery = `SELECT name, type, "notnull", pk FROM pragma_table_info(?) ORDER BY cid`;

export function schemaDefinitionQuery(name: string, kind: string): string {
  return `SELECT sql FROM sqlite_master WHERE name = ${escapeStringLiteral(name)} AND type = ${escapeStringLiteral(kind)}`;
}
