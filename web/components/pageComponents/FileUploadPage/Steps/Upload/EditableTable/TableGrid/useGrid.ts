import { ApolloError } from "@apollo/client";
import { useEffectAsync, useSetState } from "@dolthub/react-hooks";
import { ColumnForDataTableFragment, FileType } from "@gen/graphql-types";
import { handleCaughtApolloError } from "@lib/errors/helpers";
import { nTimesWithIndex } from "@lib/nTimes";
import { ReactElement, useReducer, useState } from "react";
import { DataGridProps, FillEvent } from "react-data-grid";
import { useFileUploadContext } from "../../../../contexts/fileUploadLocalForage";
import useUploadContext from "../../contexts/upload";
import { Columns, ReturnType, Row } from "./types";
import {
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

  const [state, setState] = useSetState(getDefaultState(existingCols));

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

  const onRowDelete = (rowIdx: number) => {
    const mappedIdxs = state.rows.slice(rowIdx + 1).map(r => {
      return { ...r, _idx: r._idx - 1 };
    });
    setState({
      rows: [...state.rows.slice(0, rowIdx), ...mappedIdxs],
    });
  };

  const onRowInsertAbove = (rowIdx: number) => {
    insertRow(rowIdx);
  };

  const onRowInsertBelow = (rowIdx: number) => {
    insertRow(rowIdx + 1);
  };

  function onFill({ columnKey, sourceRow, targetRow }: FillEvent<Row>): Row {
    return { ...targetRow, [columnKey]: sourceRow[columnKey as keyof Row] };
  }

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    if (!state.selectedCell) return;
    const { idx, rowIdx } = state.selectedCell;
    const pasteDataRows = defaultParsePaste(
      e.clipboardData?.getData("text/plain"),
    );
    const allRows = addEmptyRowsForPastedRows(
      pasteDataRows,
      rowIdx,
      state.columns,
    );
    const newRows = mergePastedRowsIntoExistingRows(
      pasteDataRows,
      allRows,
      state.columns,
      idx,
      rowIdx,
    );
    setState({ rows: newRows });
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
      insertRow,
      onFill,
      handlePaste,
    },
  };
}

// Splits strings copied from spreadsheet
export function defaultParsePaste(str?: string): string[][] {
  return str?.split(/\r\n|\n|\r/).map(row => row.split(/\t|,/)) ?? [];
}
