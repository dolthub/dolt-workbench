import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";

export function getBitDisplayValue(value: string): string {
  return value.charCodeAt(0).toString();
}

export function mapQueryColsToAllCols(
  queryCols: ColumnForDataTableFragment[],
  allCols?: ColumnForDataTableFragment[],
): ColumnForDataTableFragment[] {
  if (!allCols) return queryCols;
  return queryCols.map(qCol => {
    const matchedCol = allCols.find(aCol => aCol.name === qCol.name);
    return matchedCol ?? qCol;
  });
}

export function escapeDoubleQuotes(s: string): string {
  return s.replace(/"/g, `\\"`);
}

// Gets where clause for identify a row based on primary keys
// i.e. `[pk1Col] = "[pk1Val]" AND [pkNCol] = "[pkNVal]"`
export function getWhereClauseForPKValues(
  cols: ColumnForDataTableFragment[],
  row: RowForDataTableFragment,
): string {
  const colsWithValue = cols.map((col, i) => {
    const rowVal = row.columnValues[i].displayValue;
    return { col, value: rowVal };
  });
  const pkColAndVal = colsWithValue.filter(({ col }) => col.isPrimaryKey);
  const strings = pkColAndVal.map(cV => {
    const val =
      cV.col.type === "bit(1)"
        ? escapeDoubleQuotes(cV.value)
        : `"${escapeDoubleQuotes(cV.value)}"`;
    return `\`${cV.col.name}\` = ${val}`;
  });
  return strings.join(" AND ");
}

export function isLongContentType(currentColType?: string): boolean {
  if (!currentColType) return false;
  const colType = currentColType.toLowerCase();
  return (
    (colType.includes("text") && colType !== "tinytext") ||
    ((colType.startsWith("varchar") || colType.includes("character")) &&
      parseInt(colType.split(/\(|\)/)[1], 10) >= 100) ||
    colType === "json" ||
    colType === "longblob"
  );
}

// Input: ENUM('option-1','option-2')
// Output: ['option-1', 'option-2']
export function splitEnumOptions(en: string): string[] {
  const firstPar = en.indexOf("(");
  const lastPar = en.indexOf(")");
  const middle = en.substring(firstPar + 1, lastPar);
  return middle.split(",").map(v => v.replace(/'/g, ""));
}
