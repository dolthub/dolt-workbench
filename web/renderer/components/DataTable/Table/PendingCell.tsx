import { getDisplayValue, isNullValue } from "@dolthub/web-utils";
import { ColumnForDataTableFragment, ColumnValue } from "@gen/graphql-types";
import cx from "classnames";
import { useState } from "react";
import css from "./index.module.css";
import { getCellValue } from "./useCellDisplayValue";
import EditPendingCell from "./EditPendingCell";

type Props = {
  cell: ColumnValue;
  cidx: number;
  columns: ColumnForDataTableFragment[];
};

export default function PendingCell(props: Props): JSX.Element {
  const [editing, setEditing] = useState(true);
  const rawVal = props.cell.displayValue;
  const value = getDisplayValue(rawVal);
  const currentCol = props.columns[props.cidx];

  return (
    <td
      title={value}
      className={cx(css.cell, {
        [css.cellIsNull]: isNullValue(props.cell.displayValue),
      })}
    >
      {editing ? (
        <EditPendingCell
          value={rawVal}
          currentCol={currentCol}
          cidx={props.cidx}
        />
      ) : (
        <span onDoubleClick={() => setEditing(true)} className={css.cellValue}>
          {getCellValue(value, currentCol)}
        </span>
      )}
    </td>
  );
}
