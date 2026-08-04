import { QueryRunner } from "typeorm";
import * as t from "../types";

export type PgFieldDef = {
  name: string;
  tableID: number;
};

const tableNamesQuery = `SELECT oid, relname FROM pg_class WHERE oid = ANY($1)`;

export async function resolvePgResultColumns(
  qr: QueryRunner,
  fields?: PgFieldDef[],
): Promise<t.ResultColumn[] | undefined> {
  if (!fields || fields.length === 0) return undefined;

  const tableIds = [
    ...new Set(fields.map(f => f.tableID).filter(id => id > 0)),
  ];
  const tableNames = new Map<string, string>();

  if (tableIds.length > 0) {
    try {
      const rows: t.RawRows = await qr.query(tableNamesQuery, [tableIds]);
      rows.forEach(r => tableNames.set(String(r.oid), r.relname));
    } catch (err) {
      console.error("Failed to resolve result column source tables:", err);
    }
  }

  return fields.map(f => {
    return {
      name: f.name,
      sourceTable: tableNames.get(String(f.tableID)),
    };
  });
}
