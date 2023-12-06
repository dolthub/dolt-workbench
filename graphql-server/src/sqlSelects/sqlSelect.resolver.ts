import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import { ConnectionResolver } from "../connections/connection.resolver";
import { getCellValue } from "../rows/row.model";
import { RawRows, RefArgs } from "../utils/commonTypes";
import { SqlSelect, fromSqlSelectRow } from "./sqlSelect.model";

@ArgsType()
export class SqlSelectArgs extends RefArgs {
  @Field()
  queryString: string;
}

@Resolver(_of => SqlSelect)
export class SqlSelectResolver {
  constructor(private readonly conn: ConnectionResolver) {}

  @Query(_returns => SqlSelect)
  async sqlSelect(@Args() args: SqlSelectArgs): Promise<SqlSelect> {
    const conn = this.conn.connection();
    return conn.queryMaybeDolt(
      async query => {
        const res = await query(args.queryString);
        return fromSqlSelectRow(
          args.databaseName,
          args.refName,
          res,
          args.queryString,
        );
      },
      args.databaseName,
      args.refName,
    );
  }

  @Query(_returns => String)
  async sqlSelectForCsvDownload(@Args() args: SqlSelectArgs): Promise<string> {
    const conn = this.conn.connection();
    return conn.queryMaybeDolt(
      async query => {
        const res = await query(args.queryString);
        return toCsvString(res);
      },
      args.databaseName,
      args.refName,
    );
  }
}

function toCsvString(rows: RawRows): string {
  const header = Object.keys(rows[0]).join(",");
  const body = rows
    .map(row => Object.values(row).map(getCellValue).join(","))
    .join("\r\n");
  return `${header}\r\n${body}`;
}
