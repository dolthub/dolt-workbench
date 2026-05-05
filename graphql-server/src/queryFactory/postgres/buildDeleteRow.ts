export type WhereClause = { column: string; value: string };

export type DeleteRowArgs = {
  tableName: string;
  schemaName: string;
  where: WhereClause[];
};

export type BuiltDelete = {
  sql: string;
  params: string[];
  displaySql: string;
};

export function quotePgId(id: string): string {
  return `"${id.replace(/"/g, '""')}"`;
}

function escapeStringLiteral(s: string): string {
  return `'${s.replace(/'/g, "''")}'`;
}

export function buildPgDeleteRow(args: DeleteRowArgs): BuiltDelete {
  if (args.where.length === 0) {
    throw new Error("deleteRow requires at least one where clause");
  }
  const table = `${quotePgId(args.schemaName)}.${quotePgId(args.tableName)}`;
  const whereCols = args.where
    .map((w, i) => `${quotePgId(w.column)} = $${i + 1}`)
    .join(" AND ");
  const sql = `DELETE FROM ${table} WHERE ${whereCols}`;
  const params = args.where.map(w => w.value);

  const displayWhere = args.where
    .map(w => `${quotePgId(w.column)} = ${escapeStringLiteral(w.value)}`)
    .join(" AND ");
  const displaySql = `DELETE FROM ${table} WHERE ${displayWhere}`;

  return { sql, params, displaySql };
}
