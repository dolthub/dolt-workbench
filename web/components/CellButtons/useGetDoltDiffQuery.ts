import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import useSqlBuilder from "@hooks/useSqlBuilder";
import { getSqlOrderBy, mapColsToColumnNames } from "@hooks/useSqlBuilder/util";
import useSqlParser from "@hooks/useSqlParser";
import { TableParams } from "@lib/params";
import { convertTimestamp } from "./utils";

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

const diffColumns = [
  "from_commit",
  "from_commit_date",
  "to_commit",
  "to_commit_date",
];

export type ReturnType = {
  generateQuery: () => string;
  isPostgres: boolean;
};

export function useGetDoltDiffQuery(props: Props): ReturnType {
  const { convertToSqlSelect } = useSqlBuilder();
  const { parseSelectQuery, isPostgres } = useSqlParser();

  const generate = (): string => {
    const tableName = `dolt_diff_${props.params.tableName}`;
    const colsWithNamesAndVals = transformColsFromDiffCols(
      props.columns,
      props.row,
    );
    const selectCols = getSelectColumns(
      colsWithNamesAndVals,
      props.cidx,
      props.isPK,
    );
    const sel = convertToSqlSelect({
      columns: mapColsToColumnNames(selectCols),
      from: [{ table: tableName }],
    });
    const withWhere = `${sel} WHERE ${getWhereClause(colsWithNamesAndVals, props.cidx, props.isPK)}`;
    const parsed = parseSelectQuery(withWhere);

    if (!parsed) return "";

    return convertToSqlSelect({
      ...parsed,
      orderby: [getSqlOrderBy("to_commit_date", "DESC")],
    });
  };

  return { generateQuery: generate, isPostgres };
}

// Get names and values for every column based on row value
function transformColsFromDiffCols(
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
): string[] {
  // Gets all column names for row
  if (isPK) {
    return getAllSelectColumns(cols);
  }

  // Gets column names for clicked cell
  const currCol = cols[cidx];
  return ["diff_type"]
    .concat(getToAndFromCols(currCol.names))
    .concat(diffColumns);
}

export function getAllSelectColumns(
  cols: Array<{ names: string[] }>,
): string[] {
  const allCols: string[] = [];
  const reduced = cols.reduce(
    (all, c) => all.concat(getToAndFromCols(c.names)),
    allCols,
  );

  return ["diff_type"].concat(reduced).concat(diffColumns);
}

// For every name add to_ and from_ prefixes
function getToAndFromCols(names: string[]): string[] {
  const allCols: string[] = [];
  return names.reduce(
    (all, name) => all.concat(`from_${name}`, `to_${name}`),
    allCols,
  );
}

function getWhereClause(
  cols: ColumnWithNamesAndValue[],
  cidx: number,
  isPK: boolean,
): string {
  const pkConditions = getConditionsForPKs(cols);
  const cellsNotEqualCondition = getCellsNotEqualCondition(cols[cidx], isPK);
  return cellsNotEqualCondition
    ? `(${pkConditions}) ${cellsNotEqualCondition}`
    : pkConditions;
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
