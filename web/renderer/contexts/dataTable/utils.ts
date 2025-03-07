import {
  ColumnForDataTableFragment,
  ColumnValue,
  RowForDataTableFragment,
} from "@gen/graphql-types";

export function generateEmptyRow(
  columns: ColumnForDataTableFragment[],
): RowForDataTableFragment {
  const emptyRow = columns.map(column => {
    const isNotNull =
      column.constraints?.some(constraint => constraint.notNull) || false;

    let value: string;
    if (isNotNull) {
      value = getDefaultColumnValue(column);
    } else {
      value = "";
    }

    return { __typename: "ColumnValue", displayValue: value } as ColumnValue;
  });

  return { __typename: "Row", columnValues: emptyRow };
}

function getDefaultColumnValue(column: ColumnForDataTableFragment): string {
  switch (column.type.toLowerCase()) {
    case "int":
    case "integer":
    case "bigint":
      return "0";
    case "varchar":
    case "char":
    case "text":
    case "string":
      return "";
    case "datetime":
    case "timestamp":
      return new Date().toISOString();
    case "boolean":
      return "false";
    default:
      return "";
  }
}
