export type DialectInfo = {
  // Quote a table or column identifier.
  quoteId: (id: string) => string;
  // Positional parameter placeholder for the i-th param (0-indexed).
  placeholder: (i: number) => string;
  // Qualify a table name with its schema if the dialect supports schemas.
  qualifyTable: (table: string, schemaName?: string) => string;
  // Format a string value as a SQL literal. Used only for display SQL
  // echoed to the editor; executed SQL uses parameterized values.
  escapeStringLiteral: (s: string) => string;
};

function quoteMysqlId(id: string): string {
  return `\`${id.replace(/`/g, "``")}\``;
}

function quotePgId(id: string): string {
  return `"${id.replace(/"/g, '""')}"`;
}

function escapeStringLiteral(s: string): string {
  return `'${s.replace(/'/g, "''")}'`;
}

export const MYSQL_DIALECT: DialectInfo = {
  quoteId: quoteMysqlId,
  placeholder: () => "?",
  qualifyTable: table => quoteMysqlId(table),
  escapeStringLiteral,
};

export const PG_DIALECT: DialectInfo = {
  quoteId: quotePgId,
  placeholder: i => `$${i + 1}`,
  qualifyTable: (table, schemaName) =>
    `${quotePgId(schemaName ?? "public")}.${quotePgId(table)}`,
  escapeStringLiteral,
};

const NUMERIC_TYPE_PREFIXES = [
  "int",
  "bigint",
  "smallint",
  "tinyint",
  "mediumint",
  "decimal",
  "numeric",
  "float",
  "double",
  "real",
];

export function isNumericType(type: string | undefined): boolean {
  if (!type) return false;
  const t = type.toLowerCase();
  return NUMERIC_TYPE_PREFIXES.some(p => t.startsWith(p));
}

export function formatValueLiteral(
  value: string,
  type: string | undefined,
  dialect: DialectInfo,
): string {
  if (isNumericType(type)) return value;
  return dialect.escapeStringLiteral(value);
}
