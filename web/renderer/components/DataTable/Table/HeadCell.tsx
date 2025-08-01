import ChangeColumnStatusButton from "@components/CellButtons/ChangeColumnStatusButton";
import DropColumnButton from "@components/CellButtons/DropColumnButton";
import HideColumnButton from "@components/CellButtons/HideColumnButton";
import SortButton from "@components/CellButtons/SortButton";
import { CellDropdown } from "@dolthub/react-components";
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
  const showCollapseCellButton = isLongContentType(col.type, col.name);
  const dataCy = `${isMobile ? "mobile" : "desktop"}-db-data-table-column-${col.name}`;
  const dataCyDropDown = `${dataCy}-dropdown`;
  const dataCyDropDownSortButton = `${dataCyDropDown}-sort`;
  return (
    <th
      className={cx(css.cell, {
        [css.active]: showDropdown,
      })}
      data-cy={dataCy}
    >
      {col.name}
      {col.isPrimaryKey && <FiKey className={css.key} />}
      <CellDropdown
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        buttonClassName={css.menu}
        data-cy={dataCyDropDown}
      >
        <SortButton dir="ASC" col={col} dataCy={dataCyDropDownSortButton} />
        <SortButton dir="DESC" col={col} dataCy={dataCyDropDownSortButton} />
        <SortButton col={col} dataCy={dataCyDropDownSortButton} />
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
