import { Field, ID, ObjectType } from "@nestjs/graphql";
import * as column from "../columns/column.model";
import { RawRow } from "../queryFactory/types";
import * as row from "../rows/row.model";
import { QueryExecutionStatus } from "./sqlSelect.enums";

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

  @Field(_type => [row.Row])
  rows: row.Row[];

  @Field(_type => QueryExecutionStatus)
  queryExecutionStatus: QueryExecutionStatus;

  @Field()
  queryExecutionMessage: string;

  @Field(_type => [String], { nullable: true })
  warnings?: string[];
}

export function fromSqlSelectRow(
  databaseName: string,
  refName: string,
  doltRows: RawRow | RawRow[],
  queryString: string,
  warnings?: string[],
): SqlSelect {
  const res = {
    _id: `/databases/${databaseName}/refs/${refName}/queries/${queryString}`,
    databaseName,
    refName,
    queryString,
    rows: [],
    columns: [],
    queryExecutionStatus: QueryExecutionStatus.Success,
    queryExecutionMessage: "",
    warnings,
  };

  // Some mutation queries do not return an array
  if (!Array.isArray(doltRows)) {
    return {
      ...res,
      queryExecutionMessage: `Query OK, ${
        doltRows.affectedRows
      } rows affected.${
        doltRows.info.length > 0 ? doltRows.info.replace("#", " ") : ""
      }`,
    };
  }

  if (!doltRows.length) {
    return res;
  }

  const rows: row.Row[] = doltRows.map(row.fromDoltRowRes);
  const columns: column.Column[] = Object.keys(doltRows[0]).map(c => {
    return { name: c, isPrimaryKey: false, type: "unknown" };
  });

  return { ...res, columns, rows };
}
