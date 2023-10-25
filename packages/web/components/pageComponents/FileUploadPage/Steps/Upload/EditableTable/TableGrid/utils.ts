import { ColumnForDataTableFragment } from "@gen/graphql-types";
import { ReactElement, cloneElement } from "react";
import { DataGridProps, textEditor } from "react-data-grid";
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
  const { head, body } = await getGridContent(gridElement);
  const rows = [...head, ...body];
  const filtered = filterOutEmptyRowsAndCols(rows);
  const csv = filtered
    .map(cells => cells.map(serializeCellValue).join(","))
    .join("\n");
  return { csv, rows: filtered };
}

type GridContent = {
  head: string[][];
  body: string[][];
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
      head: getRows(grid, ".rdg-summary-row"),
      body: getRows(grid, ".rdg-row:not(.rdg-summary-row)"),
    };
  } catch (err) {
    console.error(err);
    return { head: [], body: [] };
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
  existingCols: ColumnForDataTableFragment[],
): GridState {
  const numDefaultCols = getNumCols(existingCols);
  const columns: Column[] = [];
  for (let i = 0; i < numDefaultCols; i++) {
    const existing = existingCols[i];
    columns.push(getColumn(i, i, existing.type, existing.name));
  }
  return {
    columns,
    rows: getEmptyRows(columns, defaultNumRows),
    contextMenuProps: null,
  };
}

// GET COLUMNS

export function getColumn(
  id: number,
  index: number,
  type: string,
  name: string,
): Column {
  return {
    _idx: index,
    name: getColumnLetterFromAlphabet(index),
    key: `${id}`,
    editable: true,
    resizable: true,
    renderEditCell: textEditor,
    width: 215,
    cellClass: (row: Row) => {
      const cl = getValidationClass(row[id], type);
      handleErrorClasses();
      return cl;
    },
    renderSummaryCell() {
      return name;
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

function getNumCols(existingCols?: ColumnForDataTableFragment[]): number {
  if (existingCols) {
    return existingCols.length;
  }
  return defaultNumCols;
}

// GET ROWS

function getEmptyRows(cols: Columns, numRows: number): Row[] {
  const rows = [];
  for (let i = 0; i < numRows; i++) {
    rows.push(getRow(i, i, cols));
  }
  return rows;
}

export function getRow(i: number, idx: number, cols: Columns): Row {
  const row: Row = { _id: i, _idx: idx };
  cols.forEach(col => {
    row[col.key] = "";
  });
  return row;
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
