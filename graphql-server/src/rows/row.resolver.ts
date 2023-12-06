import { Args, ArgsType, Field, Int, Query, Resolver } from "@nestjs/graphql";
import { ConnectionResolver } from "../connections/connection.resolver";
import { listTablesQuery } from "../tables/table.queries";
import { ROW_LIMIT } from "../utils";
import { RefArgs } from "../utils/commonTypes";
import { Row, RowList, fromDoltListRowRes } from "./row.model";
import { getRowsQuery } from "./row.queries";

@ArgsType()
export class ListRowsArgs extends RefArgs {
  @Field()
  tableName: string;

  @Field(_type => Int, { nullable: true })
  offset?: number;
}

@Resolver(_of => Row)
export class RowResolver {
  constructor(private readonly conn: ConnectionResolver) {}

  @Query(_returns => RowList)
  async rows(@Args() args: ListRowsArgs): Promise<RowList> {
    const conn = this.conn.connection();
    return conn.queryMaybeDolt(
      async query => {
        const columns = await query(listTablesQuery, [args.tableName]);
        const offset = args.offset ?? 0;
        const { q, cols } = getRowsQuery(columns);
        const rows = await query(q, [
          args.tableName,
          ...cols,
          ROW_LIMIT + 1,
          offset,
        ]);
        return fromDoltListRowRes(rows, offset);
      },
      args.databaseName,
      args.refName,
    );
  }
}
