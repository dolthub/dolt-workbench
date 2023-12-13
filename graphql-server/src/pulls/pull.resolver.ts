import {
  Args,
  ArgsType,
  Field,
  Mutation,
  Query,
  Resolver,
} from "@nestjs/graphql";
import { CommitResolver } from "../commits/commit.resolver";
import { ConnectionResolver } from "../connections/connection.resolver";
import { DBArgs } from "../utils/commonTypes";
import { PullWithDetails, fromAPIModelPullWithDetails } from "./pull.model";

@ArgsType()
class PullArgs extends DBArgs {
  @Field()
  fromBranchName: string;

  @Field()
  toBranchName: string;
}

@Resolver(_of => PullWithDetails)
export class PullResolver {
  constructor(
    private readonly conn: ConnectionResolver,
    private readonly commitResolver: CommitResolver,
  ) {}

  @Query(_returns => PullWithDetails)
  async pullWithDetails(@Args() args: PullArgs): Promise<PullWithDetails> {
    const name = `databases/${args.databaseName}/pulls/${args.fromBranchName}/${args.toBranchName}`;
    const commits = await this.commitResolver.commits({
      ...args,
      refName: args.fromBranchName,
      excludingCommitsFromRefName: args.toBranchName,
      twoDot: true,
    });

    return fromAPIModelPullWithDetails(name, commits.list);
  }

  @Mutation(_returns => Boolean)
  async mergePull(@Args() args: PullArgs): Promise<boolean> {
    const conn = this.conn.connection();
    await conn.callMerge({
      databaseName: args.databaseName,
      fromBranchName: args.fromBranchName,
      toBranchName: args.toBranchName,
    });
    return true;
  }
}
