import { Field, ID, ObjectType } from "@nestjs/graphql";
import * as column from "../columns/column.model";
import * as row from "../rows/row.model";
import { RawRow } from "../utils/commonTypes";
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
}

export function fromSqlSelectRow(
  databaseName: string,
  refName: string,
  doltRows: RawRow | RawRow[],
  queryString: string,
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

  // Get first 201 rows to determine if limit has been reached
  const sliced = doltRows.slice(0, 201);
  const rows: row.Row[] = sliced.map(row.fromDoltRowRes);
  if (!rows.length) {
    return res;
  }
  const columns: column.Column[] = Object.keys(sliced[0]).map(c => {
    return { name: c, isPrimaryKey: false, type: "unknown" };
  });

  if (rows.length > 200) {
    return {
      ...res,
      columns,
      rows: rows.slice(0, 200),
      queryExecutionStatus: QueryExecutionStatus.RowLimit,
    };
  }
  return { ...res, columns, rows };
}
