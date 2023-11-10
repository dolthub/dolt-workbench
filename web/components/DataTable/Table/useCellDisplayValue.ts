import { getBitDisplayValue, isLongContentType } from "@lib/dataTable";
import excerpt from "@lib/excerpt";
import { prettyJSONText } from "@lib/prettyJSON";
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
  colType: string,
): ReturnType {
  const [cellStatus, setCellStatus] = useState(columnStatus[cidx]);
  const [displayCellVal, setDisplayCellVal] = useState(
    getCellValue(value, colType, columnStatus[cidx]),
  );

  useEffect(() => {
    setCellStatus(columnStatus[cidx]);
  }, [columnStatus]);

  useEffect(() => {
    const val = getCellValue(value, colType, cellStatus);
    setDisplayCellVal(val);
  }, [cellStatus]);

  return { displayCellVal, setDisplayCellVal, cellStatus, setCellStatus };
}

function getCellValue(
  value: string,
  colType: string,
  cellStatusAction?: CellStatusActionType,
): string {
  if (value === "NULL") return value;
  const isLongContent = isLongContentType(colType);
  if (isLongContent) {
    if (
      colType === "json" &&
      cellStatusAction === CellStatusActionType.Expand &&
      value !== "NULL"
    ) {
      return prettyJSONText(value);
    }
    if (cellStatusAction === CellStatusActionType.Expand) {
      return value;
    }
  }

  if (colType === "bit(1)") {
    return getBitDisplayValue(value);
  }
  return excerpt(value, excerptLength);
}
