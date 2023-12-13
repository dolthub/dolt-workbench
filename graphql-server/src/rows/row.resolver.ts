import { Args, ArgsType, Field, Int, Query, Resolver } from "@nestjs/graphql";
import { ConnectionResolver } from "../connections/connection.resolver";
import { RefArgs } from "../utils/commonTypes";
import { Row, RowList, fromDoltListRowRes } from "./row.model";

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
    const columns = await conn.getTableColumns(args);
    const offset = args.offset ?? 0;
    const rows = await conn.getTableRows(args, {
      columns,
      offset,
    });
    return fromDoltListRowRes(rows, offset);
  }
}
