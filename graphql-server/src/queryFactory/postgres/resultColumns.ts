import { QueryRunner } from "typeorm";
import * as t from "../types";

export type PgFieldDef = {
  name: string;
  tableID: number;
  columnID: number;
  dataTypeID: number;
};

const resultColumnInfoQuery = `SELECT c.oid AS table_oid, c.relname AS table_name, a.attnum, ty.typname AS col_type,
  COALESCE(pk.is_pk, FALSE) AS is_pk
FROM pg_class c
JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum > 0
JOIN pg_type ty ON ty.oid = a.atttypid
LEFT JOIN (
  SELECT i.indrelid, unnest(i.indkey) AS attnum, TRUE AS is_pk
  FROM pg_index i
  WHERE i.indisprimary
) pk ON pk.indrelid = c.oid AND pk.attnum = a.attnum
WHERE c.oid = ANY($1)`;

type ColumnInfo = {
  tableName: string;
  isPk: boolean;
  type: string;
};

export async function resolvePgResultColumns(
  qr: QueryRunner,
  fields?: PgFieldDef[],
): Promise<t.ResultColumn[] | undefined> {
  if (!fields || fields.length === 0) return undefined;

  const tableIds = [
    ...new Set(fields.map(f => f.tableID).filter(id => id > 0)),
  ];
  const info = new Map<string, ColumnInfo>();

  if (tableIds.length > 0) {
    try {
      const rows: t.RawRows = await qr.query(resultColumnInfoQuery, [
        tableIds,
      ]);
      rows.forEach(r => {
        info.set(`${r.table_oid}.${r.attnum}`, {
          tableName: r.table_name,
          isPk: r.is_pk === true || r.is_pk === "t",
          type: r.col_type,
        });
      });
    } catch (err) {
      console.error("Failed to resolve result column metadata:", err);
    }
  }

  return fields.map(f => {
    const colInfo = info.get(`${f.tableID}.${f.columnID}`);
    return {
      name: f.name,
      isPrimaryKey: colInfo?.isPk ?? false,
      type: colInfo?.type ?? "unknown",
      sourceTable: colInfo?.tableName,
    };
  });
}
