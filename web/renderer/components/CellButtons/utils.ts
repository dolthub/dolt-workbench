import { isNullValue } from "@dolthub/web-utils";
import {
  ColumnForDataTableFragment,
  ForeignKeyColumnForDataTableFragment,
  ForeignKeysForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";

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

export type WhereClauseInput = {
  column: string;
  value: string;
  type: string;
};

export function toPKWhereClauses(
  row: RowForDataTableFragment,
  queryCols: ColumnForDataTableFragment[],
  tableCols?: ColumnForDataTableFragment[],
): WhereClauseInput[] {
  return mapQueryColsToAllCols(queryCols, tableCols)
    .filter(c => c.isPrimaryKey)
    .map((col, i) => {
      return {
        column: col.name,
        value: row.columnValues[i].displayValue,
        type: col.type,
      };
    });
}

export function toWhereClauses(
  row: RowForDataTableFragment,
  queryCols: ColumnForDataTableFragment[],
  tableCols?: ColumnForDataTableFragment[],
): WhereClauseInput[] {
  const mappedCols = mapQueryColsToAllCols(queryCols, tableCols);

  // Check if table schema contains any primary key columns
  const hasPrimaryKey = mappedCols.some(col => col.isPrimaryKey);

  return mappedCols
    .map((col, index) => ({ col, index })) // Preserve original index for row.columnValues
    .filter(({ col }) => !hasPrimaryKey || col.isPrimaryKey)
    .map(({ col, index }) => {
      const displayVal = row.columnValues[index]?.displayValue;
      return {
        column: col.name,
        value: isNullValue(displayVal) ? null : displayVal,
        type: col.type,
      };
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
