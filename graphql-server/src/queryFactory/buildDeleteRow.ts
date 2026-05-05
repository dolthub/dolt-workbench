import { DialectInfo, formatValueLiteral } from "./dialect";

export type WhereClause = { column: string; value: string; type?: string };

export type DeleteRowArgs = {
  tableName: string;
  schemaName?: string;
  where: WhereClause[];
};

export type BuiltDelete = {
  sql: string;
  params: string[];
  displaySql: string;
};

export function buildDeleteRow(
  args: DeleteRowArgs,
  dialect: DialectInfo,
): BuiltDelete {
  if (args.where.length === 0) {
    throw new Error("deleteRow requires at least one where clause");
  }
  const table = dialect.qualifyTable(args.tableName, args.schemaName);
  const whereSql = args.where
    .map((w, i) => `${dialect.quoteId(w.column)} = ${dialect.placeholder(i)}`)
    .join(" AND ");
  const sql = `DELETE FROM ${table} WHERE ${whereSql}`;
  const params = args.where.map(w => w.value);

  const displayWhere = args.where
    .map(
      w =>
        `${dialect.quoteId(w.column)} = ${formatValueLiteral(w.value, w.type, dialect)}`,
    )
    .join(" AND ");
  const displaySql = `DELETE FROM ${table} WHERE ${displayWhere}`;

  return { sql, params, displaySql };
}
