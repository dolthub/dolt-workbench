import { RawRows } from "../utils/commonTypes";

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
