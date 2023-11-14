import { isDoltSystemTable } from "@lib/doltSystemTables";

export const DEFAULT_LIMIT = 1000;
const exampleCreateTable = `CREATE TABLE tablename (pk INT, col1 VARCHAR(255), PRIMARY KEY (pk));`;

export function getSqlString(
  query?: string,
  tableName?: string,
  empty?: boolean,
): string {
  if (empty) {
    return exampleCreateTable;
  }
  if (!query && !tableName) return "SHOW TABLES";
  return (query || `SELECT * FROM \`${tableName}\``).replace(
    /\r\n|\n|\r/gm,
    " ",
  );
}
export function getEditorString(
  query?: string,
  tableName?: string,
  empty?: boolean,
): string {
  if (empty) {
    return sampleCreateQueryForEmpty();
  }
  return query ?? sampleQuery(tableName ?? "");
}

function addEmptyLines(lines: string[]): string {
  // eslint-disable-next-line no-empty
  while (lines.push("") < 5) {}
  return lines.join("\n");
}

export function sampleQuery(tableName?: string): string {
  if (!tableName || isDoltSystemTable(tableName)) {
    return addEmptyLines(["SHOW TABLES;"]);
  }
  return addEmptyLines([
    `SELECT * FROM \`${tableName}\``,
    `LIMIT ${DEFAULT_LIMIT};`,
  ]);
}

export function sampleCreateQueryForEmpty(): string {
  const lines = [
    "CREATE TABLE tablename (",
    "  pk INT,",
    "  col1 VARCHAR(255),",
    "  PRIMARY KEY (pk)",
    ");",
  ];

  return addEmptyLines(lines);
}
