import { getUTCDateAndTimeString } from "@dolthub/web-utils";
import {Field, Int, ObjectType} from "@nestjs/graphql";
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

@ObjectType()
export class RowWithDiff {
    @Field(_type => Int)
    index: number;

    @Field()
    diffType: string;
}

@ObjectType()
export class RowWithDiffList extends RowList {
    @Field(_type => [RowWithDiff], { nullable: true })
    diffs: RowWithDiff[] | undefined;
}

export function fromDoltListRowRes(rows: RawRow[], offset: number): RowList {
  return {
    list: rows.slice(0, ROW_LIMIT).map(fromDoltRowRes),
    nextOffset: getNextOffset(rows.length, offset),
  };
}

export function fromDoltListRowWithDiffRes(rows: RawRow[], offset: number): RowWithDiffList {

    return {
        list: rows.slice(0, ROW_LIMIT).map(fromDoltRowWithDiffRes),
        diffs: fromDoltDiffRes(rows.slice(0, ROW_LIMIT)),
        nextOffset: getNextOffset(rows.length, offset),
    };
}

export function getCellValue(value: any, colName?: string): string {
  if (value === null || value === undefined) {
    return NULL_VALUE;
  }
  if (value === '""') {
    return "";
  }
  if (Array.isArray(value) && colName === "dolt_commit") {
    if (value.length === 0) {
      return NULL_VALUE;
    }
    return value[0];
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
    columnValues: Object.entries(row).map(([key, cell]) => {
      return { displayValue: getCellValue(cell, key) };
    }),
  };
}

export function fromDoltRowWithDiffRes(row: RawRow): Row {
    const columnValues = Object.entries(row);
    return {
        columnValues: columnValues.slice(0, columnValues.length - 1).map(([key, cell]) => {
            return { displayValue: getCellValue(cell, key) };
        })
    }
}

export function fromDoltDiffRes(rows: RawRow[]) {
    let diffs: RowWithDiff[] = [];
    for (let i = 0; i < rows.length; i++) {
        if (rows[i].diff_type && (rows[i].diff_type === "modified" || rows[i].diff_type === "added")) {
            diffs.push({
                index: i,
                diffType: rows[i].diff_type,
            })
        }
    }
    return diffs;
}
