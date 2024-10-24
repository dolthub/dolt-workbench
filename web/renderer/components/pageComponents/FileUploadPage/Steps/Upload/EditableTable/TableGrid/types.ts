import { Dispatch, ReactElement } from "react";
import {
  DataGridProps,
  FillEvent,
  Column as GridColumn,
} from "react-data-grid";

export type Row = {
  _id: number;
  _idx: number;
  [key: string]: any;
};

export type SummaryRow = {
  _id: number;
};

export type Column = GridColumn<Row, SummaryRow> & {
  name: string;
  _idx: number;
};
export type Columns = Column[];

export type ContextMenuProps = {
  rowIdx: number;
  top: number;
  left: number;
};

export type GridState = {
  rows: Row[];
  columns: Columns;
  error?: Error;
  selectedCell?: { rowIdx: number; idx: number };
  contextMenuProps: ContextMenuProps | null;
};

export type GridDispatch = Dispatch<Partial<GridState>>;

export type RowObj = { rowIdx: number };

export type GridFunctions = {
  onExport: <R, SR>(g: ReactElement<DataGridProps<R, SR>>) => Promise<void>;
  onRowDelete: (rowIdx: number) => void;
  onRowInsertAbove: (rowIdx: number) => void;
  onRowInsertBelow: (rowIdx: number) => void;
  onFill: (e: FillEvent<Row>) => Row;
  insertRow: (i: number) => void;
  handlePaste: (e: ClipboardEvent) => void;
};

export type ReturnType = {
  state: GridState;
  setState: GridDispatch;
  gridFunctions: GridFunctions;
};
