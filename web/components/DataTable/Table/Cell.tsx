import EditCellInput from "@components/EditCellInput";
import { getDisplayValue, isNullValue } from "@dolthub/web-utils";
import {
  ColumnForDataTableFragment,
  ColumnValue,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import { CellStatusActionType, ColumnStatus } from "@lib/tableTypes";
import cx from "classnames";
import { useRouter } from "next/router";
import { useState } from "react";
import CreateTableCell from "./AceCell";
import CellDropdown from "./CellDropdown";
import css from "./index.module.css";
import useCellDisplayValue from "./useCellDisplayValue";
import { getDiffTypeClassnameForCell, getShowAceEditorForCell } from "./utils";

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
  const showAceCell = getShowAceEditorForCell(currentCol, router.query.q);
  const dataCy = `${props.isMobile ? "mobile-" : "desktop-"}db-data-table-row-${
    props.ridx
  }-col-${props.cidx}`;

  const { displayCellVal, cellStatus, setCellStatus } = useCellDisplayValue(
    props.columnStatus,
    props.cidx,
    value,
    currentCol.type,
  );

  if (showAceCell) {
    return <CreateTableCell value={value} data-cy={dataCy} />;
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
        <span onDoubleClick={() => setEditing(true)}>{displayCellVal}</span>
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
