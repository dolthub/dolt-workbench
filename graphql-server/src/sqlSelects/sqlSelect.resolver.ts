import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import { ConnectionProvider } from "../connections/connection.provider";
import { RawRows } from "../queryFactory/types";
import { getCellValue } from "../rows/row.model";
import { RefMaybeSchemaArgs } from "../utils/commonTypes";
import { SqlSelect, fromSqlSelectRow } from "./sqlSelect.model";

@ArgsType()
export class SqlSelectArgs extends RefMaybeSchemaArgs {
  @Field()
  queryString: string;
}

@Resolver(_of => SqlSelect)
export class SqlSelectResolver {
  constructor(private readonly conn: ConnectionProvider) {}

  @Query(_returns => SqlSelect)
  async sqlSelect(@Args() args: SqlSelectArgs): Promise<SqlSelect> {
    const conn = this.conn.connection();
    const res = await conn.getSqlSelect(args);
    return fromSqlSelectRow(
      args.databaseName,
      args.refName,
      res.rows,
      args.queryString,
      res.warnings,
    );
  }

  @Query(_returns => String)
  async sqlSelectForCsvDownload(@Args() args: SqlSelectArgs): Promise<string> {
    const conn = this.conn.connection();
    const res = await conn.getSqlSelect(args);
    return toCsvString(res.rows);
  }
}

function toCsvString(rows: RawRows): string {
  const header = Object.keys(rows[0]).join(",");
  const body = rows
    .map(row =>
      Object.entries(row)
        .map(([key, cell]) => getCellValue(cell, key))
        .join(","),
    )
    .join("\r\n");
  return `${header}\r\n${body}`;
}
