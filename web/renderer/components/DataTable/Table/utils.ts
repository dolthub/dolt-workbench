import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import { CellStatusActionType, ColumnStatus } from "@lib/tableTypes";
import cx from "classnames";
import css from "./index.module.css";

// Returns removed or added className for row in dolt_(commit_)diff_$TABLENAME
export function getDiffTypeClassNameForDiffTableRow(
  row: RowForDataTableFragment,
  cols: ColumnForDataTableFragment[],
): string {
  const diffTypeIndex = getDiffTypeColumnIndex(cols);
  const hasDiffTypeColumn = diffTypeIndex >= 0;
  if (!hasDiffTypeColumn) return "";

  const colVal = row.columnValues[diffTypeIndex].displayValue;
  if (colVal === "modified") return "";

  return cx([css[colVal]], [css[`${colVal}Row`]]);
}

export function getDiffTypeClassNameForRow(
  row: RowForDataTableFragment,
  cols: ColumnForDataTableFragment[],
): string {
  const classNameForDiffTable = getDiffTypeClassNameForDiffTableRow(row, cols);
  const diffTypeIndex = getDiffColumnIndex(
    "diff_type",
    row.diff?.diffColumnNames ?? [],
  );
  return cx(css.row, {
    [classNameForDiffTable]: !!classNameForDiffTable,
    [css.workingDiffRowAdded]:
      !classNameForDiffTable &&
      row.diff?.diffColumnValues[diffTypeIndex].displayValue === "added",
    [css.workingDiffRowModified]:
      !classNameForDiffTable &&
      row.diff?.diffColumnValues[diffTypeIndex].displayValue === "modified",
  });
}

const diffTableMetaColumns = [
  "from_commit",
  "to_commit",
  "from_commit_date",
  "to_commit_date",
  "diff_type",
];

// Returns deleted or added className for cell in modified row in
// dolt_(commit_)diff_$TABLENAME
export function getDiffTypeClassnameForCell(
  cols: ColumnForDataTableFragment[],
  row: RowForDataTableFragment,
  currCol: ColumnForDataTableFragment,
): string {
  const diffTypeIndex = getDiffTypeColumnIndex(cols);
  if (
    diffTypeIndex < 0 ||
    row.columnValues[diffTypeIndex].displayValue !== "modified" ||
    diffTableMetaColumns.includes(currCol.name)
  ) {
    return "";
  }

  const colName = currCol.name.replace(/to_|from_/, "");
  const toColIndex = cols.findIndex(c => c.name === `to_${colName}`);
  const fromColIndex = cols.findIndex(c => c.name === `from_${colName}`);
  if (toColIndex < 0 || fromColIndex < 0) return "";

  const toColVal = row.columnValues[toColIndex].displayValue;
  const fromColVal = row.columnValues[fromColIndex].displayValue;
  if (toColVal !== fromColVal) {
    if (currCol.name.startsWith("from_")) {
      return css.removed;
    }
    if (currCol.name.startsWith("to_")) {
      return css.added;
    }
  }

  return "";
}

// Returns the index of the `diff_type` column. Will return -1 if it does not
// exist
export function getDiffTypeColumnIndex(
  cols: ColumnForDataTableFragment[],
): number {
  return cols.findIndex(c => c.name === "diff_type");
}

export function getInitialColumnStatus(
  columns?: ColumnForDataTableFragment[],
): ColumnStatus {
  const initialColumnStatus: ColumnStatus = columns
    ? Array.from(Array(columns.length).keys()).reduce(
        (o, key) =>
          Object.assign(o, {
            [key]:
              columns[key].type === "json" ||
              columns[key].name.toLowerCase() === "plan"
                ? CellStatusActionType.Expand
                : CellStatusActionType.Collapse,
          }),
        {},
      )
    : {};
  return initialColumnStatus;
}

export function getShowAceEditorForCell(
  currentCol: ColumnForDataTableFragment,
  q?: string | string[],
): boolean {
  if (!q) return false;
  if (
    ![
      "Create Table",
      "pg_get_viewdef",
      "pg_get_triggerdef",
      "pg_get_functiondef",
    ].includes(currentCol.name)
  ) {
    return false;
  }
  if (Array.isArray(q)) {
    return q.some(qs => matchSchemaQuery(qs));
  }
  return matchSchemaQuery(q);
}

function matchSchemaQuery(q: string): boolean {
  return (
    !!q.match(/show create (view|event|trigger|procedure|table)/gi) ||
    !!q.match(/SELECT pg_get_viewdef/gi) ||
    !!q.match(/SELECT pg_get_triggerdef/gi) ||
    !!q.match(/SELECT pg_get_functiondef/gi)
  );
}

export function getDiffColumnIndex(colName: string, diffColumnNames: string[]) {
  return diffColumnNames.indexOf(colName);
}
