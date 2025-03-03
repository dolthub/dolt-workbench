import { getDisplayValue, isNullValue } from "@dolthub/web-utils";
import { ColumnForDataTableFragment, ColumnValue } from "@gen/graphql-types";
import { ColumnStatus } from "@lib/tableTypes";
import cx from "classnames";
import { useState } from "react";
import css from "./index.module.css";
import useCellDisplayValue from "./useCellDisplayValue";
import EditPendingCell from "./EditPendingCell";

type Props = {
  cell: ColumnValue;
  cidx: number;
  columns: ColumnForDataTableFragment[];
  columnStatus: ColumnStatus;
};

export default function PendingCell(props: Props): JSX.Element {
  const [showDropdown, setShowDropdown] = useState(false);
  const [editing, setEditing] = useState(false);
  const rawVal = props.cell.displayValue;
  const value = getDisplayValue(rawVal);
  const currentCol = props.columns[props.cidx];
  const isPK = currentCol.isPrimaryKey;

  const { displayCellVal } = useCellDisplayValue(
    props.columnStatus,
    props.cidx,
    value,
    currentCol,
  );

  return (
    <td
      title={value}
      className={cx(css.cell, {
        [css.primaryKey]: isPK,
        [css.active]: showDropdown,
        [css.cellIsNull]: isNullValue(props.cell.displayValue),
      })}
    >
      {editing ? (
        <EditPendingCell
          value={rawVal}
          currentCol={currentCol}
          cancelEditing={() => {
            setEditing(false);
            setShowDropdown(false);
          }}
        />
      ) : (
        <span onDoubleClick={() => setEditing(true)}>{displayCellVal}</span>
      )}
    </td>
  );
}
