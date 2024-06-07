import {
  ColumnForDataTableFragment,
  ForeignKeyColumnForDataTableFragment,
  ForeignKeysForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import { Conditions } from "@hooks/useSqlBuilder/util";

export function isKeyless(cols?: ColumnForDataTableFragment[]): boolean {
  return !!cols?.every(col => !col.isPrimaryKey);
}

export function pksAreShowing(
  queryCols: ColumnForDataTableFragment[],
  tableCols?: ColumnForDataTableFragment[],
): boolean {
  return (
    !isKeyless(tableCols) &&
    !!tableCols &&
    queryShowingPKs(queryCols, tableCols)
  );
}

export function queryShowingPKs(
  queryCols: ColumnForDataTableFragment[],
  tableCols?: ColumnForDataTableFragment[],
): boolean {
  if (!tableCols) return false;
  const tablePKs = tableCols.filter(c => c.isPrimaryKey);
  return tablePKs.every(pk => queryCols.some(c => c.name === pk.name));
}

export type ReferencedColumn = {
  columnName: string;
  columnValue: string;
};

export type ForeignKeyMapType = Record<string, ReferencedColumn[]>;

export function getForeignKeyMap(
  fks: ForeignKeysForDataTableFragment[] | undefined,
  row: RowForDataTableFragment,
  cidx: number,
  colName: string,
): Record<string, ReferencedColumn[]> {
  const foreignKeyMap: ForeignKeyMapType = {};
  if (!fks) return foreignKeyMap;
  const filtered = fks.filter(f => f.columnName === colName);
  filtered.forEach(f => {
    foreignKeyMap[f.referencedTableName] = getFKCols(
      f.foreignKeyColumn,
      row,
      cidx,
    );
  });
  return foreignKeyMap;
}

function getFKCols(
  cols: ForeignKeyColumnForDataTableFragment[],
  row: RowForDataTableFragment,
  cidx: number,
): ReferencedColumn[] {
  return cols.map(col => {
    return {
      columnName: col.referencedColumnName,
      columnValue: row.columnValues[cidx].displayValue,
    };
  });
}

export function getTableColsFromQueryCols(
  queryCols: ColumnForDataTableFragment[],
  tableCols?: ColumnForDataTableFragment[],
): ColumnForDataTableFragment[] {
  return queryCols.map(qc => tableCols?.find(tc => tc.name === qc.name) ?? qc);
}

export function toPKColsMapQueryCols(
  row: RowForDataTableFragment,
  queryCols: ColumnForDataTableFragment[],
  cols?: ColumnForDataTableFragment[],
): Conditions {
  return toPKCols(row, mapQueryColsToAllCols(queryCols, cols));
}

export function toPKCols(
  row: RowForDataTableFragment,
  cols: ColumnForDataTableFragment[],
): Conditions {
  return cols
    .filter(c => c.isPrimaryKey)
    .map((col, i) => {
      return { col: col.name, val: row.columnValues[i].displayValue };
    });
}

function mapQueryColsToAllCols(
  queryCols: ColumnForDataTableFragment[],
  allCols?: ColumnForDataTableFragment[],
): ColumnForDataTableFragment[] {
  if (!allCols) return queryCols;
  return queryCols.map(qCol => {
    const matchedCol = allCols.find(aCol => aCol.name === qCol.name);
    return matchedCol ?? qCol;
  });
}

// Gets timestamp format "YYYY-MM-DD HH:MM:SS"
export function convertTimestamp(ts: string): string {
  const date = new Date(ts);
  // ISO date looks like "2020-01-22T00:00:00.000Z"
  const [day, time] = date.toISOString().split("T");
  const [formattedTime] = time.split(".");
  return `${day} ${formattedTime}`;
}
