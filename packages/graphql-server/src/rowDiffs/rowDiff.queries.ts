import { getOrderByFromCols, getPKColsForRowsQuery } from "../rows/row.queries";
import { RawRows } from "../utils/commonTypes";

export const getRowsQueryAsOf = (
  columns: RawRows,
): { q: string; cols: string[] } => {
  const cols = getPKColsForRowsQuery(columns);
  return {
    q: `SELECT * FROM ?? AS OF ? ${getOrderByFromCols(
      cols.length,
    )}LIMIT ? OFFSET ?`,
    cols,
  };
};

export const tableColsQueryAsOf = `DESCRIBE ?? AS OF ?`;

export function getTableCommitDiffQuery(
  cols: RawRows,
  hasFilter = false,
): string {
  const whereDiffType = hasFilter ? ` WHERE diff_type=? ` : "";
  return `SELECT * FROM DOLT_DIFF(?, ?, ?)${whereDiffType}
  ${getOrderByFromDiffCols(cols)}
  LIMIT ?
  OFFSET ?`;
}

export function getOrderByFromDiffCols(cols: RawRows): string {
  const pkCols = cols.filter(col => col.Key === "PRI");
  const diffCols: string[] = [];
  pkCols.forEach(col => {
    diffCols.push(`to_${col.Field}`);
    diffCols.push(`from_${col.Field}`);
  });
  const orderBy = diffCols.map(c => `\`${c}\` ASC`).join(", ");
  return orderBy === "" ? "" : `ORDER BY ${orderBy} `;
}
