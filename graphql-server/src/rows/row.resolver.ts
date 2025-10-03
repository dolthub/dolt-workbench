import { Args, ArgsType, Field, Int, Query, Resolver } from "@nestjs/graphql";
import { ConnectionProvider } from "../connections/connection.provider";
import { RefMaybeSchemaArgs } from "../utils/commonTypes";
import {
  Row,
  RowList,
  fromDoltListRowRes,
  fromDoltListRowWithDiffRes,
} from "./row.model";

@ArgsType()
export class ListRowsArgs extends RefMaybeSchemaArgs {
  @Field()
  tableName: string;

  @Field(_type => Int, { nullable: true })
  offset?: number;

  @Field({ nullable: true })
  withDiff?: boolean;
}

@Resolver(_of => Row)
export class RowResolver {
  constructor(private readonly conn: ConnectionProvider) {}

  @Query(_returns => RowList)
  async rows(@Args() args: ListRowsArgs): Promise<RowList> {
    const conn = this.conn.connection();
    const pkCols = await conn.getTablePKColumns(args);
    const offset = args.offset ?? 0;
    if (args.withDiff) {
      const rowsWithDiff = await conn.getTableRowsWithDiff(args, {
        pkCols,
        offset,
      });
      return fromDoltListRowWithDiffRes(rowsWithDiff, offset);
    }
    const rows = await conn.getTableRows(args, { pkCols, offset });
    return fromDoltListRowRes(rows, offset);
  }
}
