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

export type Column = GridColumn<Row> & { name: string; _idx: number };
export type Columns = Column[];

export type GridState = {
  rows: Row[];
  columns: Columns;
  loading: boolean;
  pageToken?: string;
  error?: Error;
  selectedCell?: { rowIdx: number; idx: number };
};

export type GridDispatch = Dispatch<Partial<GridState>>;

export type RowObj = { rowIdx: number };
export type HeadObj = { column: Column };

export type GridFunctions = {
  onExport: <R, SR>(g: ReactElement<DataGridProps<R, SR>>) => Promise<void>;
  onRowDelete: (e: React.MouseEvent<HTMLDivElement>, o: RowObj) => void;
  onRowInsertAbove: (e: React.MouseEvent<HTMLDivElement>, o: RowObj) => void;
  onRowInsertBelow: (e: React.MouseEvent<HTMLDivElement>, o: RowObj) => void;
  onAddColumn: (i: number) => void;
  onDeleteColumn: (e: React.MouseEvent<HTMLDivElement>, o: HeadObj) => void;
  onFill: (e: FillEvent<Row>) => Row[];
  insertRow: (i: number) => void;
  // handleScroll: (event: React.UIEvent<HTMLDivElement>) => Promise<void>;
  handlePaste: (e: ClipboardEvent) => void;
};

export type ReturnType = {
  state: GridState;
  setState: GridDispatch;
  gridFunctions: GridFunctions;
};
