import { Args, ArgsType, Field, Int, Query, Resolver } from "@nestjs/graphql";
import { ConnectionProvider } from "../connections/connection.provider";
import { PullArgs } from "../utils/commonTypes";
import {
  fromAPIModelPullConflictSummary,
  fromAPIModelRowConflictList,
  PullConflictSummary,
  RowConflictList,
} from "./pullConflict.model";

@ArgsType()
class TableConflictArgs extends PullArgs {
  @Field()
  tableName: string;

  @Field(_type => Int, { nullable: true })
  offset?: number;
}

@Resolver(_of => PullConflictSummary)
export class PullConflictsResolver {
  constructor(private readonly conn: ConnectionProvider) {}

  @Query(_returns => [PullConflictSummary], { nullable: true })
  async pullConflictsSummary(
    @Args() args: PullArgs,
  ): Promise<PullConflictSummary[]> {
    const conn = this.conn.connection();
    const res = await conn.getPullConflictsSummary(args);
    return res.map(r =>
      fromAPIModelPullConflictSummary(
        r,
        args.databaseName,
        args.fromBranchName,
        args.toBranchName,
      ),
    );
  }

  @Query(_returns => RowConflictList)
  async pullRowConflicts(
    @Args() args: TableConflictArgs,
  ): Promise<RowConflictList> {
    const conn = this.conn.connection();
    const offset = args.offset ?? 0;
    const res = await conn.getPullRowConflicts({ ...args, offset });
    return fromAPIModelRowConflictList(res, offset);
  }
}
