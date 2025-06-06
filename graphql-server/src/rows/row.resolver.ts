import { Args, ArgsType, Field, Int, Query, Resolver } from "@nestjs/graphql";
import { ConnectionProvider } from "../connections/connection.provider";
import { RefMaybeSchemaArgs } from "../utils/commonTypes";
import { Row, RowList, fromDoltListRowRes } from "./row.model";

@ArgsType()
export class ListRowsArgs extends RefMaybeSchemaArgs {
  @Field()
  tableName: string;

  @Field(() => Int, { nullable: true })
  offset?: number;
}

@Resolver(() => Row)
export class RowResolver {
  constructor(private readonly conn: ConnectionProvider) {}

  @Query(() => RowList)
  async rows(@Args() args: ListRowsArgs): Promise<RowList> {
    const conn = this.conn.connection();
    const pkCols = await conn.getTablePKColumns(args);
    const offset = args.offset ?? 0;
    const rows = await conn.getTableRows(args, {
      pkCols,
      offset,
    });
    return fromDoltListRowRes(rows, offset);
  }
}
