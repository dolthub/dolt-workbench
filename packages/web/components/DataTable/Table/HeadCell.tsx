import ChangeColumnStatusButton from "@components/CellButtons/ChangeColumnStatusButton";
import DropColumnButton from "@components/CellButtons/DropColumnButton";
import HideColumnButton from "@components/CellButtons/HideColumnButton";
import SortButton from "@components/CellButtons/SortButton";
import CellDropdown from "@components/CellDropdown";
import { ColumnForDataTableFragment } from "@gen/graphql-types";
import { isLongContentType } from "@lib/dataTable";
import {
  CellStatusActionType,
  ColumnStatus,
  SetColumnStatus,
} from "@lib/tableTypes";
import { FiKey } from "@react-icons/all-files/fi/FiKey";
import cx from "classnames";
import { useState } from "react";
import css from "./index.module.css";

type Props = {
  col: ColumnForDataTableFragment;
  columns: ColumnForDataTableFragment[];
  isMobile?: boolean;
  columnStatus: ColumnStatus;
  setColumnStatus: SetColumnStatus;
  idx: number;
};

export default function HeadCell({
  col,
  columns,
  isMobile,
  columnStatus,
  setColumnStatus,
  idx,
}: Props) {
  const [showDropdown, setShowDropdown] = useState(false);
  const showCollapseCellButton = isLongContentType(col.type);
  return (
    <th
      className={cx(css.cell, {
        [css.active]: showDropdown,
      })}
    >
      {col.name}
      {col.isPrimaryKey && <FiKey className={css.key} />}
      <CellDropdown
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        buttonClassName={css.menu}
        isMobile={isMobile}
      >
        <SortButton dir="ASC" col={col} />
        <SortButton dir="DESC" col={col} />
        <SortButton col={col} />
        <HideColumnButton col={col} columns={columns} />
        {!col.isPrimaryKey && <DropColumnButton col={col} />}
        {showCollapseCellButton && (
          <ChangeColumnStatusButton
            columnStatus={columnStatus}
            setColumnStatus={setColumnStatus}
            setShowDropdown={setShowDropdown}
            index={idx}
            newStatus={
              columnStatus[idx] === CellStatusActionType.Expand
                ? CellStatusActionType.Collapse
                : CellStatusActionType.Expand
            }
          />
        )}
      </CellDropdown>
    </th>
  );
}
