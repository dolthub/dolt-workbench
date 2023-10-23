import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import { nTimesWithIndex } from "@lib/nTimes";
import { isNullValue } from "@lib/null";
import { KeyboardEvent, ReactElement, cloneElement } from "react";
import { DataGridProps, TextEditor } from "react-data-grid";
import { Column, Columns, GridState, Row } from "./types";
import { getValidationClass, handleErrorClasses } from "./validate";

type Grid = {
  csv: string;
  rows: string[][];
};

const defaultNumCols = 7;
const defaultNumRows = 51;
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// EXPORT GRID

export async function getGridAsCsv<R, SR>(
  gridElement: ReactElement<DataGridProps<R, SR>>,
): Promise<Grid> {
  const { body, foot } = await getGridContent(gridElement);
  const rows = [...body, ...foot];
  const filtered = filterOutEmptyRowsAndCols(rows);
  const csv = filtered
    .map(cells => cells.map(serializeCellValue).join(","))
    .join("\n");
  return { csv, rows: filtered };
}

type GridContent = {
  head: string[][];
  body: string[][];
  foot: string[][];
};

async function getGridContent<R, SR>(
  gridElement: ReactElement<DataGridProps<R, SR>>,
): Promise<GridContent> {
  try {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const grid = document.createElement("div");
    grid.innerHTML = renderToStaticMarkup(
      cloneElement(gridElement, {
        enableVirtualization: false,
      }),
    );

    return {
      head: getRows(grid, ".rdg-header-row"),
      body: getRows(grid, ".rdg-row:not(.rdg-summary-row)"),
      foot: getRows(grid, ".rdg-summary-row"),
    };
  } catch (err) {
    console.error(err);
    return { head: [], body: [], foot: [] };
  }

  function getRows(grid: HTMLDivElement, selector: string): string[][] {
    return Array.from(grid.querySelectorAll<HTMLDivElement>(selector)).map(
      gridRow =>
        Array.from(
          gridRow.querySelectorAll<HTMLDivElement>(
            ".rdg-cell:not(.index-cell)",
          ),
        ).map(gridCell => gridCell.innerText),
    );
  }
}

export function filterOutEmptyRowsAndCols(rows: string[][]): string[][] {
  const filteredEmptyRows = rows.filter(row => !row.every(cell => cell === ""));
  if (filteredEmptyRows.length === 0) {
    return [];
  }

  const emptyColIndexes = filteredEmptyRows[0]
    .map((_, colIdx) => colIdx)
    .filter(colIdx => filteredEmptyRows.every(row => row[colIdx] === ""));

  const filteredEmptyCols = filteredEmptyRows.map(row =>
    row.filter((_, colIdx) => !emptyColIndexes.includes(colIdx)),
  );

  return filteredEmptyCols;
}

function serializeCellValue(value: string): string {
  const formattedValue = value.replace(/"/g, '""');
  return formattedValue.includes(",") ||
    formattedValue.includes('"') ||
    formattedValue.includes("\n")
    ? `"${formattedValue}"`
    : formattedValue;
}

// DEFAULT STATE

export function getDefaultState(
  rows: string[][] | undefined,
  existingCols?: ColumnForDataTableFragment[],
): GridState {
  const numDefaultCols = getNumCols(rows, existingCols);
  const columns: Column[] = [];
  for (let i = 0; i < numDefaultCols; i++) {
    const existing = existingCols ? existingCols[i] : undefined;
    columns.push(getColumn(i, i, existing?.type));
  }
  return {
    columns,
    rows: getDefaultRows(rows, columns, existingCols),
    loading: false,
  };
}

// GET COLUMNS

export function getColumn(id: number, index: number, type?: string): Column {
  return {
    _idx: index,
    name: getColumnLetterFromAlphabet(index),
    key: `${id}`,
    editable: true,
    resizable: true,
    editor: TextEditor,
    width: 215,
    cellClass: (row: Row) => {
      const cl = getValidationClass(row._idx, row[id], type);
      handleErrorClasses();
      return cl;
    },
  };
}

// A, B, C, ..., Y, Z, AA, AB, AC, ...
export function getColumnLetterFromAlphabet(index: number): string {
  if (index > 25) {
    const first = Math.floor(index / 26);
    const mod = 26 * first;
    const second = Math.floor(index % mod);
    return `${alphabet[first - 1]}${alphabet[second]}`;
  }
  return alphabet[index];
}

function getNumCols(
  rows: string[][] | undefined,
  existingCols?: ColumnForDataTableFragment[],
): number {
  if (rows?.length) {
    return rows[0].length;
  }
  if (existingCols) {
    return existingCols.length;
  }
  return defaultNumCols;
}

// If pasted rows go beyond columns boundary, add more empty columns
export function getColumnsFromPastedData(
  pastedRows: string[][],
  colIdx: number,
  existingCols: Columns,
): Columns {
  if (pastedRows.length === 0) return existingCols;
  const numMoreCols = colIdx + pastedRows[0].length - existingCols.length - 1;
  return numMoreCols > 0
    ? [
        ...existingCols,
        ...nTimesWithIndex(numMoreCols, num => {
          const newColIdx = num + existingCols.length;
          return getColumn(newColIdx, newColIdx);
        }),
      ]
    : existingCols;
}

// GET ROWS

function getEmptyRows(
  cols: Columns,
  numRows: number,
  startingFrom: number,
  existingCols?: ColumnForDataTableFragment[],
): Row[] {
  const rows = [];
  const start = existingCols ? startingFrom + 1 : startingFrom;
  if (existingCols) {
    rows.push(getRowFromExistingColumns(0, cols, existingCols));
  }
  for (let i = start; i < numRows; i++) {
    rows.push(getRow(i, i, cols));
  }
  return rows;
}

function getRowFromExistingColumns(
  i: number,
  cols: Columns,
  existingCols: ColumnForDataTableFragment[],
): Row {
  const row: Row = { _id: i, _idx: i };
  cols.forEach((col, idx) => {
    const name = idx < existingCols.length ? existingCols[idx].name : "";
    row[col.key] = name;
  });
  return row;
}

export function getRow(i: number, idx: number, cols: Columns): Row {
  const row: Row = { _id: i, _idx: idx };
  cols.forEach(col => {
    row[col.key] = "";
  });
  return row;
}

function getDefaultRows(
  rows: string[][] | undefined,
  columns: Column[],
  existingCols?: ColumnForDataTableFragment[],
  existingRows?: RowForDataTableFragment[],
): Row[] {
  if (rows) {
    return getRowsFromExistingCsv(columns, rows);
  }
  if (existingRows) {
    const mappedRows = existingRows.map(r =>
      r.columnValues.map(v => getExistingRowValue(v.displayValue)),
    );
    return getRowsFromExistingCsv(columns, mappedRows, existingCols);
  }
  return getEmptyRows(columns, defaultNumRows, 0, existingCols);
}

export function getExistingRowValue(dv: string): string {
  return isNullValue(dv) ? "" : dv;
}

function getRowsFromExistingCsv(
  cols: Column[],
  rows: string[][],
  existingCols?: ColumnForDataTableFragment[],
): Row[] {
  const existingRows: Row[] = [];
  if (existingCols) {
    existingRows.push(getRowFromExistingColumns(0, cols, existingCols));
  }
  rows.forEach((row, i) => {
    const rIdx = existingCols ? i + 1 : i;
    const newRow: Row = { _id: rIdx, _idx: rIdx };
    cols.forEach((col, colI) => {
      newRow[col.key] = row[colI];
    });
    existingRows.push(newRow);
  });

  const numExisting = existingRows.length;
  const emptyRows =
    numExisting < defaultNumRows
      ? getEmptyRows(cols, defaultNumRows - numExisting, numExisting)
      : [];
  return [...existingRows, ...emptyRows];
}

export function mergePastedRowsIntoExistingRows(
  pastedRows: string[][],
  existingRows: Row[],
  cols: Columns,
  colIdx: number,
  rowIdx: number,
): Row[] {
  const newRows = pastedRows.map((row, i) => {
    const rowToUpdate = existingRows[i + rowIdx];
    cols.slice(colIdx - 1, colIdx + row.length - 1).forEach((col, j) => {
      rowToUpdate[col.key] = row[j];
    });
    return rowToUpdate;
  });

  return [
    ...existingRows.slice(0, rowIdx),
    ...newRows,
    ...existingRows.slice(rowIdx + newRows.length),
  ];
}

// NAVIGATION

// Default onEditorNavigation, which is overridden for arrow keys in columns array
function onEditorNavigation({
  key,
  target,
}: React.KeyboardEvent<HTMLDivElement>): boolean {
  if (
    key === "Tab" &&
    (target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement)
  ) {
    return target.matches(
      ".rdg-editor-container > :only-child, .rdg-editor-container > label:only-child > :only-child",
    );
  }
  return false;
}

export function customOnNavigation(
  event: KeyboardEvent<HTMLDivElement>,
): boolean {
  return onEditorNavigation(event) || event.key.startsWith("Arrow");
}

export function isAtBottom({
  currentTarget,
}: React.UIEvent<HTMLDivElement>): boolean {
  return (
    currentTarget.scrollTop + 10 >=
    currentTarget.scrollHeight - currentTarget.clientHeight
  );
}
