import ChangeCellStatusButton from "@components/CellButtons/ChangeCellStatusButton";
import CopyButton from "@components/CellButtons/CopyButton";
import EditCell from "@components/CellButtons/EditCell";
import MakeNullButton from "@components/CellButtons/MakeNullButton";
import EditCellInput from "@components/EditCellInput";
import { CellDropdown } from "@dolthub/react-components";
import {
  excerpt,
  getDisplayValue,
  isNullValue,
  prettyJSONText,
} from "@dolthub/web-utils";
import {
  ColumnForDataTableFragment,
  ColumnValueForTableListFragment,
  RowDiffForTableListFragment,
} from "@gen/graphql-types";
import { getBitDisplayValue, isLongContentType } from "@lib/dataTable";
import { CellStatusActionType, ColumnStatus } from "@lib/tableTypes";
import { IoReturnDownForwardSharp } from "@react-icons/all-files/io5/IoReturnDownForwardSharp";
import { MdKeyboardTab } from "@react-icons/all-files/md/MdKeyboardTab";
import { MdSpaceBar } from "@react-icons/all-files/md/MdSpaceBar";
import cx from "classnames";
import { useEffect, useState } from "react";
import css from "./index.module.css";
import { getJSONDiff, getTextDiff, hideButton } from "./utils";

export enum CellType {
  Added = "added",
  Deleted = "deleted",
}

export enum CellStatusType {
  Expanded = "expanded",
  Collapsed = "collapsed",
}

type Props = {
  type: CellType;
  thisVal: ColumnValueForTableListFragment;
  otherVal?: ColumnValueForTableListFragment;
  row: RowDiffForTableListFragment;
  cols: ColumnForDataTableFragment[];
  cidx: number;
  ridx: number;
  hideCellButtons?: boolean;
  columnStatus: ColumnStatus;
  refName: string;
};

const whitespaceRegex = /\s|\r|\t|\n/g;

export default function Cell(props: Props) {
  const thisVal = props.thisVal.displayValue;
  const otherVal = props.otherVal?.displayValue;
  const cellModified = thisVal !== otherVal;
  const [showDropdown, setShowDropdown] = useState(false);
  const [editing, setEditing] = useState(false);
  const currCol =
    props.cidx < props.cols.length ? props.cols[props.cidx] : undefined;
  const isNull = isNullValue(thisVal);
  const showChangeStatusButtons = isLongContentType(currCol?.type);
  const [cellStatusAction, setCellStatusAction] =
    useState<CellStatusActionType>(props.columnStatus[props.cidx]);

  const className = cx(css.cell, {
    [css.isNull]: isNull,
    [css[props.type]]: thisVal !== otherVal,
    [css.longContent]: cellStatusAction !== CellStatusActionType.Collapse,
  });

  const [cellVal, setCellVal] = useState(
    getCellValue(thisVal, currCol?.type, cellStatusAction, otherVal),
  );

  useEffect(() => {
    setCellStatusAction(props.columnStatus[props.cidx]);
  }, [props.columnStatus]);

  useEffect(() => {
    if (isLongContentType(currCol?.type)) {
      const val = getCellValue(
        thisVal,
        currCol?.type,
        cellStatusAction,
        otherVal,
      );
      setCellVal(val);
    }
  }, [cellStatusAction]);

  return (
    <td
      className={cx(css.cell, className, {
        [css.clicked]: editing || showDropdown,
      })}
      data-cy={`cell-${props.ridx}-${props.cidx}`}
    >
      {props.row.added ? (
        <span>
          {editing && currCol ? (
            <EditCellInput
              currentCol={currCol}
              value={thisVal}
              cancelEditing={() => {
                setEditing(false);
                setShowDropdown(false);
              }}
              largerMarginRight
              queryCols={props.cols}
              row={props.row.added}
              refName={props.refName}
            />
          ) : (
            <>
              <CellDropdown
                showDropdown={showDropdown}
                setShowDropdown={setShowDropdown}
                buttonClassName={css.dropdownButton}
              >
                <CopyButton
                  value={getDisplayValue(thisVal)}
                  colType={currCol?.type}
                />
                {props.type === CellType.Added &&
                  !props.hideCellButtons &&
                  currCol && (
                    <>
                      <EditCell
                        setEditing={setEditing}
                        queryCols={props.cols}
                      />
                      <MakeNullButton
                        currCol={currCol}
                        queryCols={props.cols}
                        row={props.row.added}
                        isNull={isNull}
                        refName={props.refName}
                      />
                    </>
                  )}
                {showChangeStatusButtons &&
                  Object.values(CellStatusActionType)
                    .filter(c => !hideButton(c, cellStatusAction, cellModified))
                    .map(c => (
                      <ChangeCellStatusButton
                        key={c}
                        statusAction={c}
                        setCellStatus={setCellStatusAction}
                        setShowDropdown={setShowDropdown}
                      />
                    ))}
              </CellDropdown>
              <span>{cellVal}</span>
            </>
          )}
        </span>
      ) : (
        <span>{cellVal}</span>
      )}
    </td>
  );
}

const excerptLength = 40;

function getCellValue(
  thisVal: string,
  colType?: string,
  cellStatus?: CellStatusActionType,
  otherVal?: string,
) {
  const cellModified = thisVal !== otherVal;
  const whitespaceDifference =
    thisVal.replaceAll(whitespaceRegex, "") ===
    otherVal?.replaceAll(whitespaceRegex, "");
  const val = getDisplayValue(thisVal);

  if (colType === "bit(1)") {
    if (val === "NULL") return val;
    return getBitDisplayValue(val);
  }

  const longContent = isLongContentType(colType);
  if (!longContent && cellModified && whitespaceDifference) {
    return val.split("").map(getLetterOrIcon);
  }

  if (longContent) {
    const isJSON = colType === "json";
    const deltas = isJSON
      ? getJSONDiff(thisVal, otherVal)
      : getTextDiff(val, getDisplayValue(otherVal || ""));
    const expandedVal =
      isJSON && !isNullValue(thisVal) ? prettyJSONText(val) : val;
    if (cellStatus === CellStatusActionType.Expand) {
      return expandedVal;
    }
    if (
      cellStatus === CellStatusActionType.Deltas ||
      (!cellStatus && cellModified)
    ) {
      return deltas;
    }
    return excerpt(val, excerptLength);
  }

  return excerpt(val, excerptLength);
}

function getLetterOrIcon(s: string): string | JSX.Element {
  switch (s) {
    case " ":
      return <MdSpaceBar className={cx(css.icon, css.space)} />;
    case "\n":
    case "\r":
      return <IoReturnDownForwardSharp className={cx(css.icon, css.marX)} />;
    case "\t":
      return <MdKeyboardTab className={cx(css.icon, css.marX)} />;
    default:
      return s;
  }
}
