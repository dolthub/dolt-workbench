import { Field, ID, ObjectType } from "@nestjs/graphql";
import * as column from "../columns/column.model";
import { RawRow } from "../queryFactory/types";
import * as row from "../rows/row.model";
import { QueryExecutionStatus } from "./sqlSelect.enums";
import { ROW_LIMIT, getNextOffset } from "../utils";
import { RowList } from "../rows/row.model";

@ObjectType()
export class SqlSelect {
  @Field(_type => ID)
  _id: string;

  @Field()
  databaseName: string;

  @Field()
  refName: string;

  @Field()
  queryString: string;

  @Field(_type => [column.Column])
  columns: column.Column[];

  @Field(_type => RowList)
  rows: RowList;

  @Field(_type => QueryExecutionStatus)
  queryExecutionStatus: QueryExecutionStatus;

  @Field()
  queryExecutionMessage: string;

  @Field()
  isMutation: boolean;

  @Field(_type => [String], { nullable: true })
  warnings?: string[];
}

export function fromSqlSelectRow(
  databaseName: string,
  refName: string,
  doltRows: RawRow[],
  isMutation: boolean,
  executionMessage: string,
  queryString: string,
  offset: number,
  warnings?: string[],
): SqlSelect {
  // eslint-disable-next-line no-console
  console.log("[isMutation-probe]", {
    queryString: queryString.slice(0, 120),
    isMutation,
    rowCount: doltRows.length,
    executionMessage,
    sample: doltRows.length > 0 ? Object.keys(doltRows[0]) : null,
  });
  const res = {
    _id: `/databases/${databaseName}/refs/${refName}/queries/${queryString}`,
    databaseName,
    refName,
    queryString,
    rows: { list: [] },
    columns: [],
    queryExecutionStatus: QueryExecutionStatus.Success,
    queryExecutionMessage: executionMessage,
    isMutation,
    warnings,
  };

  if (isMutation || doltRows.length === 0) {
    return res;
  }

  const rows: row.Row[] = doltRows
    .slice(offset, offset + ROW_LIMIT)
    .map(row.fromDoltRowRes);
  const columns: column.Column[] = Object.keys(doltRows[0]).map(c => {
    return { name: c, isPrimaryKey: false, type: "unknown" };
  });

  return {
    ...res,
    columns,
    rows: {
      list: rows,
      nextOffset: getNextOffset(doltRows.length, offset),
    },
  };
}
