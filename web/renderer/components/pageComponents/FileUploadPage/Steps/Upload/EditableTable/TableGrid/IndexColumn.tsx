import cx from "classnames";
import css from "./index.module.css";
import { Column } from "./types";

const cellClass = cx("index-cell", css.rowIndex);
export const indexColumn: Column = {
  _idx: -1,
  key: "index-column",
  name: "",
  width: 37,
  maxWidth: 37,
  resizable: false,
  sortable: false,
  frozen: true,
  editable: false,
  renderCell: ({ row }) => <div>{row._idx + 1}</div>,
  renderSummaryCell: () => <div>*</div>,
  cellClass,
  summaryCellClass: cellClass,
};
