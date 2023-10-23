import { ApolloError } from "@apollo/client";
import { ColumnForDataTableFragment, FileType } from "@gen/graphql-types";
import useEffectAsync from "@hooks/useEffectAsync";
import useSetState from "@hooks/useSetState";
import { handleCaughtApolloError } from "@lib/errors/helpers";
import { nTimesWithIndex } from "@lib/nTimes";
import { ReactElement, useReducer, useState } from "react";
import { DataGridProps, FillEvent } from "react-data-grid";
import { useFileUploadContext } from "../../../../contexts/fileUploadLocalForage";
import useUploadContext from "../../contexts/upload";
import { Columns, HeadObj, ReturnType, Row, RowObj } from "./types";
import {
  getColumn,
  getColumnLetterFromAlphabet,
  getColumnsFromPastedData,
  getDefaultState,
  getGridAsCsv,
  getRow,
  mergePastedRowsIntoExistingRows,
} from "./utils";

export default function useGrid(
  existingCols: ColumnForDataTableFragment[],
): ReturnType {
  const { onUpload, setState: setUcState } = useUploadContext();
  const { state: fState, setState: setForageState } = useFileUploadContext();

  const [state, setState] = useSetState(
    getDefaultState(fState.spreadsheetRows, existingCols),
  );

  const [nextId, setNextId] = useReducer(
    (id: number) => id + 1,
    state.rows[state.rows.length - 1]._id + 1,
  );
  const [submitting, setSubmitting] = useState(false);

  useEffectAsync(
    async ({ subscribed }) => {
      if (!submitting || !fState.selectedFile?.size) {
        return;
      }
      if (subscribed) setSubmitting(false);
      try {
        await onUpload();
      } catch (err) {
        if (subscribed) {
          handleCaughtApolloError(err, e => setUcState({ error: e }));
        }
      }
    },
    [
      submitting,
      fState.selectedFile?.size,
      setSubmitting,
      onUpload,
      setUcState,
    ],
  );

  const onExport = async <R, SR>(
    gridElement: ReactElement<DataGridProps<R, SR>>,
  ) => {
    try {
      const { csv, rows } = await getGridAsCsv(gridElement);
      if (rows.length === 0) {
        setState({ error: new Error("cannot upload empty spreadsheet") });
        return;
      }
      const firstRow = csv.split("\n")[0];

      const enc = new TextEncoder();
      // encode text utf-8
      const contents = enc.encode(csv);

      const file = new File([contents], "editor.csv", { type: "text/csv" });
      setForageState({
        selectedFile: file,
        spreadsheetRows: rows,
        fileType: FileType.Csv,
        colNames: firstRow,
      });
      setSubmitting(true);
    } catch (e) {
      setUcState({ error: e as ApolloError });
    }
  };

  const insertRow = (insertRowIdx: number) => {
    const newRow: Row = getRow(nextId, insertRowIdx, state.columns);
    const mappedIdxs = state.rows.slice(insertRowIdx).map(r => {
      return { ...r, _idx: r._idx + 1 };
    });
    setState({
      rows: [...state.rows.slice(0, insertRowIdx), newRow, ...mappedIdxs],
    });
    setNextId();
  };

  const onRowDelete = (
    _: React.MouseEvent<HTMLDivElement>,
    { rowIdx }: RowObj,
  ) => {
    const mappedIdxs = state.rows.slice(rowIdx + 1).map(r => {
      return { ...r, _idx: r._idx - 1 };
    });
    setState({
      rows: [...state.rows.slice(0, rowIdx), ...mappedIdxs],
    });
  };

  const onRowInsertAbove = (
    _: React.MouseEvent<HTMLDivElement>,
    { rowIdx }: RowObj,
  ) => {
    insertRow(rowIdx);
  };

  const onRowInsertBelow = (
    _: React.MouseEvent<HTMLDivElement>,
    { rowIdx }: RowObj,
  ) => {
    insertRow(rowIdx + 1);
  };

  const onAddColumn = (insertColIdx: number) => {
    const newCol = getColumn(insertColIdx, insertColIdx);
    const mapped = state.columns.slice(insertColIdx).map(c => {
      const newIdx = c._idx + 1;
      return {
        ...c,
        _idx: newIdx,
        key: `${Number(c.key) + 1}`,
        name: getColumnLetterFromAlphabet(newIdx),
      };
    });
    const newCols = [
      ...state.columns.slice(0, insertColIdx),
      newCol,
      ...mapped,
    ];
    const mappedRows = state.rows.map(row => {
      const keys = Object.keys(row);
      const newRow: Row = { [newCol.key]: "", _id: row._id, _idx: row._idx };
      keys.forEach(key => {
        const num = Number(key);
        if (num >= insertColIdx) {
          newRow[`${num + 1}`] = row[key];
        } else {
          newRow[key] = row[key];
        }
      });
      return newRow;
    });
    setState({ columns: newCols, rows: mappedRows });
  };

  const onDeleteColumn = (
    _: React.MouseEvent<HTMLDivElement>,
    { column }: HeadObj,
  ) => {
    const mappedNames = state.columns.slice(column._idx + 1).map(c => {
      return {
        ...c,
        name: getColumnLetterFromAlphabet(Number(c._idx) - 1),
        _idx: c._idx - 1,
      };
    });
    const newCols = [...state.columns.slice(0, column._idx), ...mappedNames];
    const newRows = state.rows.map(row => {
      const newRow = row;
      delete newRow[column.key];
      return newRow;
    });
    setState({ columns: newCols, rows: newRows });
  };

  function onFill({ columnKey, sourceRow, targetRows }: FillEvent<Row>): Row[] {
    return targetRows.map(targetRow => {
      return { ...targetRow, [columnKey]: sourceRow[columnKey as keyof Row] };
    });
  }

  // async function handleScroll(event: React.UIEvent<HTMLDivElement>) {
  // if (
  //   state.loading ||
  //   fState.spreadsheetRows ||
  //   !state.pageToken ||
  //   // !existingTable ||
  //   !isAtBottom(event)
  // ) {
  //   return;
  // }

  // setState({ loading: true });

  // const res = await existingTable.loadMore(state.pageToken);
  // let next = nextId;
  // const newRows = res?.rows.list.map((row, i) => {
  //   const newRow: Row = { _id: next, _idx: state.rows.length + i };
  //   state.columns.forEach((col, colI) => {
  //     const val =
  //       colI < row.columnValues.length
  //         ? getExistingRowValue(row.columnValues[colI].displayValue)
  //         : "";
  //     newRow[col.key] = val;
  //   });
  //   next += 1;
  //   setNextId();
  //   return newRow;
  // });

  // setState({
  //   rows: [...state.rows, ...(newRows ?? [])],
  //   loading: false,
  //   pageToken: res?.rows.nextPageToken ?? undefined,
  // });
  // }

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    if (!state.selectedCell) return;
    const { idx, rowIdx } = state.selectedCell;
    const pasteDataRows = defaultParsePaste(
      e.clipboardData?.getData("text/plain"),
    );
    const newCols = getColumnsFromPastedData(pasteDataRows, idx, state.columns);
    const allRows = addEmptyRowsForPastedRows(pasteDataRows, rowIdx, newCols);
    const newRows = mergePastedRowsIntoExistingRows(
      pasteDataRows,
      allRows,
      newCols,
      idx,
      rowIdx,
    );
    setState({
      columns: newCols,
      rows: newRows,
    });
  };

  // If pasted rows go beyond row boundary, add more empty rows
  function addEmptyRowsForPastedRows(
    pastedRows: string[][],
    rowIdx: number,
    cols: Columns,
  ): Row[] {
    if (pastedRows.length === 0) return state.rows;
    const numMoreRows = pastedRows.length - (state.rows.length - rowIdx);
    if (numMoreRows <= 0) return state.rows;
    const next = nextId;
    const newRows = nTimesWithIndex(numMoreRows, n => {
      setNextId();
      return getRow(next + n, n + state.rows.length, cols);
    });
    return [...state.rows, ...newRows];
  }

  return {
    state,
    setState,
    gridFunctions: {
      onExport,
      onRowDelete,
      onRowInsertAbove,
      onRowInsertBelow,
      onAddColumn,
      onDeleteColumn,
      insertRow,
      onFill,
      // handleScroll,
      handlePaste,
    },
  };
}

// Splits strings copied from spreadsheet
export function defaultParsePaste(str?: string): string[][] {
  return str?.split(/\r\n|\n|\r/).map(row => row.split("\t")) ?? [];
}
