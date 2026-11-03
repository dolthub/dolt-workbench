import { excerpt, prettyJSONText } from "@dolthub/web-utils";
import { ColumnForDataTableFragment } from "@gen/graphql-types";
import { getBitDisplayValue, isLongContentType } from "@lib/dataTable";
import {
  CellStatusActionType,
  ColumnStatus,
  SetCellStatusAction,
} from "@lib/tableTypes";
import { useEffect, useMemo, useState } from "react";

const excerptLength = 40;

type ReturnType = {
  displayCellVal: string;
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
  const displayCellVal = useMemo(
    () => getCellValue(value, currCol, cellStatus),
    [value, currCol, cellStatus],
  );

  useEffect(() => {
    setCellStatus(columnStatus[cidx]);
  }, [cidx, columnStatus]);

  return { displayCellVal, cellStatus, setCellStatus };
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
