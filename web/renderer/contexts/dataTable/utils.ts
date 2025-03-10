import {
  ColumnForDataTableFragment,
  ColumnValue,
  RowForDataTableFragment,
} from "@gen/graphql-types";

export function generateEmptyRow(
  columns: ColumnForDataTableFragment[],
): RowForDataTableFragment {
  const emptyRow = columns.map(column => {
    const value = getDefaultColumnValue(column);
    console.log(column.type, value);
    return { __typename: "ColumnValue", displayValue: value } as ColumnValue;
  });

  return { __typename: "Row", columnValues: emptyRow };
}

function getDefaultColumnValue(column: ColumnForDataTableFragment): string {
  const isNotNull =
    column.constraints?.some(constraint => constraint.notNull) || false;

  const columnType = column.type.toLowerCase();
  if (columnType.includes("int")) {
    return "0";
  }
  if (
    columnType.includes("char") ||
    columnType.includes("text") ||
    columnType.includes("string")
  ) {
    return "";
  }
  if (columnType.includes("date") || columnType.includes("timestamp")) {
    return new Date().toISOString();
  }
  if (columnType.includes("boolean")) {
    return "false";
  }

  if (!isNotNull) {
    return "";
  }

  return "NULL";
}
