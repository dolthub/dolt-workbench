import { RawRows } from "../types";

// Cannot use params here for the database revision. It will incorrectly
// escape refs with dots
export function useDB(dbName: string, refName?: string, isDolt = true): string {
  if (refName && isDolt) {
    return `USE \`${dbName}/${refName}\``;
  }
  return `USE \`${dbName}\``;
}

export const databasesQuery = `SHOW DATABASES`;

export const columnsQuery = `DESCRIBE ??`;

export const foreignKeysQuery = `SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE table_name=? AND table_schema=? AND referenced_table_schema IS NOT NULL`;

export const indexQuery = `SELECT 
  table_name, 
  index_name, 
  GROUP_CONCAT(comment) as COMMENTS, 
  GROUP_CONCAT(non_unique) AS NON_UNIQUES, 
  GROUP_CONCAT(column_name ORDER BY seq_in_index) AS COLUMNS 
FROM information_schema.statistics 
WHERE table_name=? AND index_name!="PRIMARY" 
GROUP BY index_name;`;

export const listTablesQuery = `SHOW FULL TABLES WHERE table_type = 'BASE TABLE'`;

export const tableColsQuery = `SHOW FULL TABLES WHERE table_type = 'BASE TABLE'`;

export const getRowsQuery = (
  columns: RawRows,
): { q: string; cols: string[] } => {
  const cols = getPKColsForRowsQuery(columns);
  return {
    q: `SELECT * FROM ?? ${getOrderByFromCols(cols.length)}LIMIT ? OFFSET ?`,
    cols,
  };
};

export function getPKColsForRowsQuery(cs: RawRows): string[] {
  const pkCols = cs.filter(col => col.Key === "PRI");
  const cols = pkCols.map(c => c.Field);
  return cols;
}

// Creates ORDER BY statement with column parameters
// i.e. ORDER BY ::col1, ::col2
export function getOrderByFromCols(numCols: number): string {
  if (!numCols) return "";
  const pkCols = Array.from({ length: numCols })
    .map(() => `? ASC`)
    .join(", ");
  return pkCols === "" ? "" : `ORDER BY ${pkCols} `;
}

export const getViewsQuery = `SELECT TABLE_SCHEMA, TABLE_NAME 
FROM information_schema.tables 
WHERE TABLE_TYPE = 'VIEW' AND TABLE_SCHEMA = ?`;

export const getTriggersQuery = `SHOW TRIGGERS`;

export const getEventsQuery = `SHOW EVENTS`;

export const proceduresQuery = `SHOW PROCEDURE STATUS WHERE type = "PROCEDURE" AND db = ?`;
