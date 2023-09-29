import { ColumnForDataTableFragment } from "@gen/graphql-types";
import { isDoltSystemTable } from "@lib/doltSystemTables";

const sqlSelectRowLimit = 200;

export const exampleCreateTable = `CREATE TABLE tablename (pk INT, col1 VARCHAR(255), PRIMARY KEY (pk));`;

type EditorStringResult = {
  sqlQuery: string;
  showDefaultQueryInfo: boolean;
};

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
  cols?: ColumnForDataTableFragment[],
): EditorStringResult {
  if (empty) {
    return {
      sqlQuery: sampleCreateQueryForEmpty(),
      showDefaultQueryInfo: false,
    };
  }
  return query
    ? { sqlQuery: query, showDefaultQueryInfo: false }
    : sampleQuery(tableName ?? "", cols);
}

function getOrderByClause(cols?: ColumnForDataTableFragment[]) {
  if (!cols || cols.length === 0) {
    return "";
  }
  const colCauses = cols
    .filter(col => col.isPrimaryKey)
    .map(c => `\`${c.name}\` ASC`)
    .join(", ");
  return colCauses !== "" ? `ORDER BY ${colCauses}` : "";
}

export function sampleQuery(
  tableName?: string,
  cols?: ColumnForDataTableFragment[],
): EditorStringResult {
  let lines: string[];
  const orderByClause = getOrderByClause(cols);
  if (!tableName || isDoltSystemTable(tableName)) {
    lines = ["SHOW TABLES;"];
  } else {
    lines = [
      "SELECT *",
      `FROM \`${tableName}\``,
      orderByClause,
      `LIMIT ${sqlSelectRowLimit};`,
    ];
  }
  lines = lines.filter(line => line !== "");
  // eslint-disable-next-line no-empty
  while (lines.push("") < 5) {}
  return {
    sqlQuery: lines.join("\n"),
    showDefaultQueryInfo: orderByClause !== "" && lines[0] !== "SHOW TABLES;",
  };
}

export function sampleCreateQueryForEmpty(): string {
  const lines = [
    "CREATE TABLE tablename (",
    "  pk INT,",
    "  col1 VARCHAR(255),",
    "  PRIMARY KEY (pk)",
    ");",
  ];

  return lines.join("\n");
}
