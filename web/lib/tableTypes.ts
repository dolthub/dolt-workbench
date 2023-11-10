export enum CellStatusActionType {
  Expand = "Expand Cell",
  Collapse = "Collapse Cell",
  Deltas = "Show Deltas",
}

export type SetCellStatusAction = React.Dispatch<
  React.SetStateAction<CellStatusActionType>
>;

export type ColumnStatus = { [key: number]: CellStatusActionType };

export type SetColumnStatus = React.Dispatch<
  React.SetStateAction<ColumnStatus>
>;
