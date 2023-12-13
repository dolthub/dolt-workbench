import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import { Conditions } from "@hooks/useSqlBuilder/util";
import { mapQueryColsToAllCols } from "@lib/dataTable";
import { TableParams } from "@lib/params";

export type Props = {
  cidx: number;
  columns: ColumnForDataTableFragment[];
  row: RowForDataTableFragment;
  params: TableParams;
  isPK: boolean;
};

type ColumnWithNamesAndValue = {
  column: ColumnForDataTableFragment;
  names: string[];
  value: string;
};

export const diffColumns = [
  "from_commit",
  "from_commit_date",
  "to_commit",
  "to_commit_date",
];

const orderBy = "ORDER BY to_commit_date DESC";

export function getDoltDiffQuery(props: Props): string {
  const tableName = `dolt_diff_${props.params.tableName}`;
  const colsWithNamesAndVals = transformColsFromDiffCols(
    props.columns,
    props.row,
  );
  const columns = getSelectColumns(
    colsWithNamesAndVals,
    props.cidx,
    props.isPK,
  );
  const pkConditions = getConditionsForPKs(colsWithNamesAndVals);
  const cellsNotEqualCondition = getCellsNotEqualCondition(
    colsWithNamesAndVals[props.cidx],
    props.isPK,
  );
  const conditions = cellsNotEqualCondition
    ? `(${pkConditions}) ${cellsNotEqualCondition}`
    : pkConditions;

  return `SELECT ${columns}\nFROM \`${tableName}\`\nWHERE ${conditions}\n${orderBy}`;
}

// Get names and values for every column based on row value
export function transformColsFromDiffCols(
  cols: ColumnForDataTableFragment[],
  row: RowForDataTableFragment,
): ColumnWithNamesAndValue[] {
  return cols.map((col, i) => {
    const rowVal = row.columnValues[i].displayValue;
    return { column: col, names: [col.name], value: rowVal };
  });
}

// If PK cell clicked, get all columns in "from_[col1], to_[col1], ..."" order
// If not PK cell clicked, get "from_[col], to_[col]" for current column
function getSelectColumns(
  cols: ColumnWithNamesAndValue[],
  cidx: number,
  isPK: boolean,
): string {
  // Gets all column names for row
  if (isPK) {
    return getAllSelectColumns(cols);
  }

  // Gets column names for clicked cell
  const currCol = cols[cidx];
  return ["diff_type"]
    .concat(getToAndFromCols(currCol.names))
    .concat(diffColumns)
    .join(", ");
}

export function getAllSelectColumns(cols: Array<{ names: string[] }>): string {
  const allCols: string[] = [];
  const reduced = cols.reduce(
    (all, c) => all.concat(getToAndFromCols(c.names)),
    allCols,
  );

  return ["diff_type"].concat(reduced).concat(diffColumns).join(", ");
}

// For every name add to_ and from_ prefixes
function getToAndFromCols(names: string[]): string[] {
  const allCols: string[] = [];
  return names.reduce(
    (all, name) => all.concat(`\`from_${name}\``, `\`to_${name}\``),
    allCols,
  );
}

// Looks like "(to_pk1=val1 AND to_pk2=val2...) OR (from_pk1=val1 AND from_pk2=val2...)"
function getConditionsForPKs(cols: ColumnWithNamesAndValue[]): string {
  const toConditionStrings = getConditionString(cols, "to");
  const fromConditionStrings = getConditionString(cols, "from");
  return `${toConditionStrings} OR ${fromConditionStrings}`;
}

// Gets condition string for either "to" or "from" prefix and join with comma
function getConditionString(
  cols: ColumnWithNamesAndValue[],
  prefix: "to" | "from",
): string {
  const strings = cols
    .map(col => getConditionForPK(prefix, col))
    .filter(Boolean) as string[];
  const joined = strings.join(" AND ");
  return strings.length > 1 ? `(${joined})` : joined;
}

// If column is primary key, get condition for one name "pk=val"
// Or for multiple names "(pk_tag1=val OR pk_tag2=val)"
function getConditionForPK(
  prefix: "to" | "from",
  col: ColumnWithNamesAndValue,
): string | null {
  if (!col.column.isPrimaryKey) {
    return null;
  }
  const conditions = col.names.map(name => {
    const value =
      col.column.type === "TIMESTAMP" ? convertTimestamp(col.value) : col.value;
    return `\`${prefix}_${name}\` = "${value}"`;
  });

  if (conditions.length === 1) {
    return conditions[0];
  }
  return `(${conditions.join(" OR ")})`;
}

// For cell history, gets all rows where from and to columns not equal
// Looks like "AND (`from_[name]` <> `to_[name]` OR (`from_[name]` IS NULL AND `to_[name]`
// IS NOT NULL) OR (`from_[name]` IS NOT NULL AND `to_[name]` IS NULL) ...)"
function getCellsNotEqualCondition(
  currCol: ColumnWithNamesAndValue,
  isPK: boolean,
): string | null {
  if (isPK) {
    return null;
  }
  const names = currCol.names.map(name => {
    const colsNotEqual = `\`from_${name}\` <> \`to_${name}\``;
    const fromIsNull = `\`from_${name}\` IS NULL AND \`to_${name}\` IS NOT NULL`;
    const toIsNull = `\`from_${name}\` IS NOT NULL AND \`to_${name}\` IS NULL`;
    return `${colsNotEqual} OR (${fromIsNull}) OR (${toIsNull})`;
  });
  return `AND (${names.join(" OR ")})`;
}

// Gets timestamp format "YYYY-MM-DD HH:MM:SS"
export function convertTimestamp(ts: string): string {
  const date = new Date(ts);
  // ISO date looks like "2020-01-22T00:00:00.000Z"
  const [day, time] = date.toISOString().split("T");
  const [formattedTime] = time.split(".");
  return `${day} ${formattedTime}`;
}

export function toPKCols(
  row: RowForDataTableFragment,
  cols: ColumnForDataTableFragment[],
): Conditions {
  return cols
    .filter(c => c.isPrimaryKey)
    .map((col, i) => {
      return { col: col.name, val: row.columnValues[i].displayValue };
    });
}

export function toPKColsMapQueryCols(
  row: RowForDataTableFragment,
  queryCols: ColumnForDataTableFragment[],
  cols?: ColumnForDataTableFragment[],
): Conditions {
  return toPKCols(row, mapQueryColsToAllCols(queryCols, cols));
}
