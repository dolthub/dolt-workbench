import ChangeCellStatusButton from "@components/CellButtons/ChangeCellStatusButton";
import CopyButton from "@components/CellButtons/CopyButton";
import EditCell from "@components/CellButtons/EditCell";
import FilterButton from "@components/CellButtons/FilterButton";
import ForeignKeyButton from "@components/CellButtons/ForeignKeyButton";
import HistoryButton from "@components/CellButtons/HistoryButton";
import MakeNullButton from "@components/CellButtons/MakeNullButton";
import Dropdown from "@components/CellDropdown";
import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import { isLongContentType } from "@lib/dataTable";
import { isNullValue } from "@lib/null";
import { CellStatusActionType, SetCellStatusAction } from "@lib/tableTypes";
import css from "./index.module.css";

type Props = {
  cidx: number;
  ridx: number;
  row: RowForDataTableFragment;
  columns: ColumnForDataTableFragment[];
  isMobile?: boolean;
  showDropdown: boolean;
  setShowDropdown: (s: boolean) => void;
  value: string;
  rawVal: string;
  currentCol: ColumnForDataTableFragment;
  setEditing: (e: boolean) => void;
  cellStatus: CellStatusActionType;
  setCellStatus: SetCellStatusAction;
};

export default function CellDropdown(props: Props) {
  const isNull = isNullValue(props.rawVal);
  const showCollapseCellButton = isLongContentType(props.currentCol.type);
  return (
    <Dropdown
      showDropdown={props.showDropdown}
      setShowDropdown={props.setShowDropdown}
      buttonClassName={css.menu}
      isMobile={props.isMobile}
      data-cy={`${props.currentCol.name}-dropdown-button-${props.ridx}`}
    >
      <CopyButton
        value={props.value}
        colType={props.currentCol.type}
        disabled={isNull}
      />
      <EditCell setEditing={props.setEditing} queryCols={props.columns} />
      <MakeNullButton
        row={props.row}
        queryCols={props.columns}
        currCol={props.currentCol}
        isNull={isNull}
      />
      <HistoryButton {...props} />
      <FilterButton value={props.rawVal} col={props.currentCol} />
      <ForeignKeyButton {...props} colName={props.currentCol.name} />
      {showCollapseCellButton && (
        <ChangeCellStatusButton
          setCellStatus={props.setCellStatus}
          setShowDropdown={props.setShowDropdown}
          statusAction={
            props.cellStatus === CellStatusActionType.Expand
              ? CellStatusActionType.Collapse
              : CellStatusActionType.Expand
          }
        />
      )}
    </Dropdown>
  );
}
