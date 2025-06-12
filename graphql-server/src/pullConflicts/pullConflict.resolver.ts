import { Args, Query, Resolver } from "@nestjs/graphql";
import { ConnectionProvider } from "../connections/connection.provider";
import { PullArgs } from "../utils/commonTypes";
import {
  fromAPIModelPullConflictSummary,
  PullConflictSummary,
} from "./pullConflict.model";

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
}
