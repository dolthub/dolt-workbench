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
    const conn = await this.conn.connection(args.databaseName);
    const res = await conn.getSqlSelect(args);
    return fromSqlSelectRow(
      args.databaseName,
      args.refName,
      res,
      args.queryString,
    );
  }

  @Query(_returns => String)
  async sqlSelectForCsvDownload(@Args() args: SqlSelectArgs): Promise<string> {
    const conn = await this.conn.connection(args.databaseName);
    const res = await conn.getSqlSelect(args);
    return toCsvString(res);
  }
}

function toCsvString(rows: RawRows): string {
  const header = Object.keys(rows[0]).join(",");
  const body = rows
    .map(row => Object.values(row).map(getCellValue).join(","))
    .join("\r\n");
  return `${header}\r\n${body}`;
}
