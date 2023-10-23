import cx from "classnames";
import { FormatterProps } from "react-data-grid";
import css from "./index.module.css";
import { Column, Row } from "./types";

function IndexFormatter(props: FormatterProps<Row>) {
  const name = props.row._idx === 0 ? "*" : props.row._idx;
  return <div>{name}</div>;
}

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
  formatter: IndexFormatter,
  cellClass: cx("index-cell", css.rowIndex),
  editorOptions: {
    editOnClick: false,
  },
};
