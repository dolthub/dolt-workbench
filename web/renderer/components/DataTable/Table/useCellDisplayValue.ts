import { excerpt, prettyJSONText } from "@dolthub/web-utils";
import { ColumnForDataTableFragment } from "@gen/graphql-types";
import { getBitDisplayValue, isLongContentType } from "@lib/dataTable";
import {
  CellStatusActionType,
  ColumnStatus,
  SetCellStatusAction,
} from "@lib/tableTypes";
import { useEffect, useState } from "react";

const excerptLength = 40;

type ReturnType = {
  displayCellVal: string;
  setDisplayCellVal: (v: string) => void;
  cellStatus: CellStatusActionType;
  setCellStatus: SetCellStatusAction;
};

export default function useCellDisplayValue(
  columnStatus: ColumnStatus,
  cidx: number,
  value: string,
  currCol: ColumnForDataTableFragment,
): ReturnType {
  const [cellStatus, setCellStatus] = useState(columnStatus[cidx]);
  const [displayCellVal, setDisplayCellVal] = useState(
    getCellValue(value, currCol, columnStatus[cidx]),
  );

  useEffect(() => {
    setCellStatus(columnStatus[cidx]);
  }, [cidx, columnStatus]);

  useEffect(() => {
    const val = getCellValue(value, currCol, cellStatus);
    setDisplayCellVal(val);
  }, [cellStatus, currCol, value]);

  return { displayCellVal, setDisplayCellVal, cellStatus, setCellStatus };
}

function getCellValue(
  value: string,
  currCol: ColumnForDataTableFragment,
  cellStatusAction?: CellStatusActionType,
): string {
  if (value === "NULL") return value;
  const isLongContent = isLongContentType(currCol.type, currCol.name);
  if (isLongContent) {
    if (
      currCol.type === "json" &&
      cellStatusAction === CellStatusActionType.Expand &&
      value !== "NULL"
    ) {
      return prettyJSONText(value);
    }
    if (cellStatusAction === CellStatusActionType.Expand) {
      return value;
    }
  }

  if (currCol.type === "bit(1)") {
    return getBitDisplayValue(value);
  }
  return excerpt(value, excerptLength);
}
