import EditCellInput from "@components/EditCellInput";
import {
  ColumnForDataTableFragment,
  ColumnValue,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import { getDisplayValue, isNullValue } from "@lib/null";
import { CellStatusActionType, ColumnStatus } from "@lib/tableTypes";
import cx from "classnames";
import { useRouter } from "next/router";
import { useState } from "react";
import CellDropdown from "./CellDropdown";
import CreateTableCell from "./CreateTableCell";
import css from "./index.module.css";
import useCellDisplayValue from "./useCellDisplayValue";
import { getDiffTypeClassnameForCell, isCreateTableCell } from "./utils";

type Props = {
  cell: ColumnValue;
  cidx: number;
  ridx: number;
  row: RowForDataTableFragment;
  columns: ColumnForDataTableFragment[];
  columnStatus: ColumnStatus;
  isMobile?: boolean;
};

export default function Cell(props: Props): JSX.Element {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [editing, setEditing] = useState(false);
  const rawVal = props.cell.displayValue;
  const value = getDisplayValue(rawVal);
  const currentCol = props.columns[props.cidx];
  const isPK = currentCol.isPrimaryKey;
  const className = getDiffTypeClassnameForCell(
    props.columns,
    props.row,
    currentCol,
  );
  const createTableCell = isCreateTableCell(currentCol, router.query.q);
  const dataCy = `${props.isMobile ? "mobile-" : "desktop-"}db-data-table-row-${
    props.ridx
  }-col-${props.cidx}`;

  const { displayCellVal, cellStatus, setCellStatus } = useCellDisplayValue(
    props.columnStatus,
    props.cidx,
    value,
    currentCol.type,
  );

  if (createTableCell) {
    return (
      <CreateTableCell
        value={value}
        data-cy={dataCy}
        isMobile={props.isMobile}
      />
    );
  }

  return (
    <td
      title={value}
      data-cy={dataCy}
      className={cx(css.cell, className, {
        [css.primaryKey]: isPK,
        [css.active]: showDropdown,
        [css.cellIsNull]: isNullValue(props.cell.displayValue),
        [css.longContent]:
          props.columnStatus[props.cidx] === CellStatusActionType.Expand ||
          cellStatus === CellStatusActionType.Expand,
      })}
    >
      {editing ? (
        <EditCellInput
          row={props.row}
          queryCols={props.columns}
          value={rawVal}
          currentCol={currentCol}
          cancelEditing={() => {
            setEditing(false);
            setShowDropdown(false);
          }}
        />
      ) : (
        <span>{displayCellVal}</span>
      )}
      {!editing && (
        <CellDropdown
          {...props}
          showDropdown={showDropdown}
          setShowDropdown={setShowDropdown}
          value={value}
          rawVal={rawVal}
          currentCol={currentCol}
          setEditing={setEditing}
          cellStatus={cellStatus}
          setCellStatus={setCellStatus}
        />
      )}
    </td>
  );
}
