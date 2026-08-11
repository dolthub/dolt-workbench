import ChangeCellStatusButton from "@components/CellButtons/ChangeCellStatusButton";
import CopyButton from "@components/CellButtons/CopyButton";
import EditCell from "@components/CellButtons/EditCell";
import FilterButton from "@components/CellButtons/FilterButton";
import ForeignKeyButton from "@components/CellButtons/ForeignKeyButton";
import HistoryButton from "@components/CellButtons/HistoryButton";
import MakeNullButton from "@components/CellButtons/MakeNullButton";
import buttonCss from "@components/CellButtons/index.module.css";
import NotDoltWrapper from "@components/util/NotDoltWrapper";
import { useDataTableContext } from "@contexts/dataTable";
import { CellDropdown as Dropdown } from "@dolthub/react-components";
import { isNullValue } from "@dolthub/web-utils";
import cx from "classnames";
import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import { isLongContentType } from "@lib/dataTable";
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
  dataCy: string;
};

export default function CellDropdown(props: Props) {
  const { columns: tableCols, loading } = useDataTableContext();
  const isNull = isNullValue(props.rawVal);
  const showCollapseCellButton = isLongContentType(
    props.currentCol.type,
    props.currentCol.name,
  );
  return (
    <Dropdown
      showDropdown={props.showDropdown}
      setShowDropdown={props.setShowDropdown}
      buttonClassName={css.menu}
      data-cy={props.dataCy}
    >
      <CopyButton
        value={props.value}
        colType={props.currentCol.type}
        disabled={isNull}
      />
      {loading && !tableCols ? (
        <span className={cx(buttonCss.button, buttonCss.loading)}>
          Loading...
        </span>
      ) : (
        <>
          <EditCell
            setEditing={props.setEditing}
            queryCols={props.columns}
            dataCy={`${props.dataCy}-edit`}
          />
          <MakeNullButton
            row={props.row}
            queryCols={props.columns}
            currCol={props.currentCol}
            isNull={isNull}
          />
          <NotDoltWrapper
            loader={
              <span className={cx(buttonCss.button, buttonCss.loading)}>
                Loading...
              </span>
            }
          >
            <HistoryButton {...props} />
          </NotDoltWrapper>
          <FilterButton
            value={props.rawVal}
            col={props.currentCol}
            dataCy={`${props.dataCy}-filter`}
          />
          <ForeignKeyButton {...props} colName={props.currentCol.name} />
        </>
      )}
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
