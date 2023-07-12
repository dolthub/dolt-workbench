import { Field, ObjectType } from "@nestjs/graphql";
import { convertDateToUTCDatetimeString } from "../utils";
import { RawRow } from "../utils/commonTypes";

// Using an unprintable string for null values so we can distinguish between
// string "null" and null
export const NULL_VALUE = "\uf5f2\ueb94NULL\uf5a8\ue6ff";

@ObjectType()
export class ColumnValue {
  @Field()
  displayValue: string;
}

@ObjectType()
export class Row {
  @Field(_type => [ColumnValue])
  columnValues: ColumnValue[];
}

export function getCellValue(value: any): string {
  if (value === null || value === undefined) {
    return NULL_VALUE;
  }
  if (value === '""') {
    return "";
  }
  if (typeof value === "object") {
    if (Object.prototype.toString.call(value) === "[object Date]") {
      return convertDateToUTCDatetimeString(value);
    }
    if (Buffer.isBuffer(value)) {
      return value.toString("utf8");
    }
    return JSON.stringify(value);
  }

  return value;
}

export function fromDoltRowRes(row: RawRow): Row {
  return {
    columnValues: Object.values(row).map(cell => {
      return { displayValue: getCellValue(cell) };
    }),
  };
}
