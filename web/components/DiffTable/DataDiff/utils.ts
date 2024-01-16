import { safeJSONParse } from "@dolthub/web-utils";
import {
  ColumnForDataTableFragment,
  ColumnForDiffTableListFragment,
  RowDiff,
} from "@gen/graphql-types";
import { isLongContentType } from "@lib/dataTable";
import { getDisplayValue, isNullValue } from "@lib/null";
import { CellStatusActionType, ColumnStatus } from "@lib/tableTypes";
import * as diff from "diff";

export type HiddenColIndexes = number[];

export type SetHiddenColIndexes = React.Dispatch<
  React.SetStateAction<HiddenColIndexes>
>;

export function hideColumn(
  index: number,
  setHiddenColIndexes: SetHiddenColIndexes,
): void {
  setHiddenColIndexes(oldIndexes => oldIndexes.concat(index));
}

export function isHiddenColumn(
  index: number,
  hiddenColIndexes: HiddenColIndexes,
): boolean {
  return hiddenColIndexes.includes(index);
}

export function unhideColumn(
  index: number,
  setHiddenColIndexes: SetHiddenColIndexes,
): void {
  setHiddenColIndexes(oldIndexes => oldIndexes.filter(i => i !== index));
}

export function hasColDiff(rowDiffs: RowDiff[], colNum: number): boolean {
  return !!rowDiffs.some(
    rowDiff =>
      !rowDiff.added?.columnValues ||
      !rowDiff.deleted?.columnValues ||
      rowDiff.added.columnValues[colNum].displayValue !==
        rowDiff.deleted.columnValues[colNum].displayValue,
  );
}

export function getUnchangedColIndexes(
  rowDiffColumns: ColumnForDataTableFragment[],
  rowDiffs: RowDiff[],
): HiddenColIndexes {
  const unchangedColIndexes = [] as HiddenColIndexes;

  rowDiffColumns.forEach((_, i) => {
    if (!hasColDiff(rowDiffs, i)) {
      unchangedColIndexes.push(i);
    }
  });

  return unchangedColIndexes;
}

export function getIsPKTable(cols: ColumnForDataTableFragment[]): boolean {
  return cols.some(col => col.isPrimaryKey);
}

export function getColumnInitialStatus(
  rowDiffColumns: ColumnForDiffTableListFragment[],
): ColumnStatus {
  const rowLength = rowDiffColumns.length || 0;
  const initialColumnStatus: ColumnStatus = {};
  for (let i = 0; i < rowLength; i++) {
    if (!isLongContentType(rowDiffColumns[i].type || "")) {
      initialColumnStatus[i] = CellStatusActionType.Collapse;
    }
  }
  return initialColumnStatus;
}

export function hideButton(
  c: CellStatusActionType,
  cellStatusAction?: CellStatusActionType,
  cellModified?: boolean,
): boolean {
  /* cellStatusAction===undefined:initial load for long content cells 
     for cells not modified, show excerpt content
     for cells modified, show deltas
  */
  return (
    c === cellStatusAction ||
    (!cellStatusAction &&
      !cellModified &&
      c === CellStatusActionType.Collapse) ||
    (!cellStatusAction && !!cellModified && c === CellStatusActionType.Deltas)
  );
}

function concatChanges(changes: Diff.Change[]): string {
  let deleted = "";
  if (changes.filter(c => c.removed).length === 0) {
    return "...";
  }
  changes.forEach((change, i) => {
    if (change.removed) {
      deleted += change.value;
    }
    if (!change.added && !change.removed) {
      const unchanged = change.value.split("\n");
      const len = unchanged.length;
      if (i === changes.length - 1 || len === 2) {
        deleted += len > 2 ? `${unchanged[0]}\n...` : `${unchanged[0]}\n`;
      } else {
        deleted +=
          i === 0
            ? `...\n${unchanged[unchanged.length - 2]}\n`
            : `${unchanged[0]}\n${len > 3 ? "..." : ""}\n${
                unchanged[unchanged.length - 2]
              }\n`;
      }
    }
  });
  return deleted;
}

export function getJSONDiff(thisVal: string, otherVal?: string): string {
  if (!otherVal || isNullValue(thisVal) || isNullValue(otherVal)) {
    return getDisplayValue(thisVal);
  }

  const changes = diff.diffJson(
    safeJSONParse(thisVal),
    safeJSONParse(otherVal),
  );
  return concatChanges(changes);
}

export function breakTextIntoLines(text: string, width: number): string {
  const words = text.split(" ");
  let res = "";
  let oneLine = "";
  words.forEach(w => {
    if (oneLine.length + 1 + w.length <= width) {
      oneLine = oneLine.length ? `${oneLine} ${w}` : w;
    } else {
      res = res.length ? `${res}\n${oneLine}` : oneLine;
      oneLine = w;
    }
  });

  return oneLine.length ? `${res}${res.length ? "\n" : ""}${oneLine}` : res;
}

export function getTextDiff(thisVal: string, otherVal?: string): string {
  const thisValBreak = breakTextIntoLines(thisVal, 40);
  const otherValBreak = breakTextIntoLines(otherVal ?? "", 40);
  const changes = diff.diffLines(thisValBreak, otherValBreak);
  return concatChanges(changes);
}
