import { getUTCDateAndTimeString } from "@dolthub/web-utils";
import { Field, ObjectType } from "@nestjs/graphql";
import { RawRow } from "../queryFactory/types";
import { ROW_LIMIT, getNextOffset } from "../utils";
import { ListOffsetRes } from "../utils/commonTypes";

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

@ObjectType()
export class RowList extends ListOffsetRes {
  @Field(_type => [Row])
  list: Row[];
}

export function fromDoltListRowRes(rows: RawRow[], offset: number): RowList {
  return {
    list: rows.slice(0, ROW_LIMIT).map(fromDoltRowRes),
    nextOffset: getNextOffset(rows.length, offset),
  };
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
      return getUTCDateAndTimeString(value);
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
