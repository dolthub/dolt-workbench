import {
  Args,
  ArgsType,
  Field,
  Mutation,
  Query,
  Resolver,
} from "@nestjs/graphql";
import { ConnectionProvider } from "../connections/connection.provider";
import { DBArgs, DBArgsWithOffset, RemoteArgs } from "../utils/commonTypes";
import {
  RemoteBranchDiffCounts,
  FetchRes,
  fromFetchRes,
  fromPullRes,
  fromPushRes,
  getRemoteListRes,
  PullRes,
  PushRes,
  Remote,
  RemoteList,
} from "./remote.model";

@ArgsType()
export class AddRemoteArgs extends RemoteArgs {
  @Field()
  remoteUrl: string;
}

@ArgsType()
export class PullOrPushRemoteArgs extends RemoteArgs {
  @Field()
  refName: string;

  @Field()
  branchName: string;
}

@ArgsType()
export class RemoteMaybeBranchArgs extends RemoteArgs {
  @Field({ nullable: true })
  branchName?: string;
}

@ArgsType()
export class RemoteBranchDiffCountsArgs extends DBArgs {
  @Field()
  fromRefName: string;

  @Field()
  toRefName: string;
}

@Resolver(() => Remote)
export class RemoteResolver {
  constructor(private readonly conn: ConnectionProvider) {}

  @Query(() => RemoteList)
  async remotes(@Args() args: DBArgsWithOffset): Promise<RemoteList> {
    const conn = this.conn.connection();

    const res = await conn.getRemotes({ ...args, offset: args.offset ?? 0 });
    return getRemoteListRes(res, args);
  }

  @Mutation(() => String)
  async addRemote(@Args() args: AddRemoteArgs): Promise<string> {
    const conn = this.conn.connection();
    await conn.addRemote(args);
    return args.remoteName;
  }

  @Mutation(() => Boolean)
  async deleteRemote(@Args() args: RemoteArgs): Promise<boolean> {
    const conn = this.conn.connection();
    await conn.callDeleteRemote(args);
    return true;
  }

  @Mutation(() => PullRes)
  async pullFromRemote(@Args() args: PullOrPushRemoteArgs): Promise<PullRes> {
    const conn = this.conn.connection();
    const res = await conn.callPullRemote(args);
    if (res.length === 0) {
      throw new Error("No response from pull");
    }
    return fromPullRes(res[0]);
  }

  @Mutation(() => PushRes)
  async pushToRemote(@Args() args: PullOrPushRemoteArgs): Promise<PushRes> {
    const conn = this.conn.connection();
    const res = await conn.callPushRemote(args);
    if (res.length === 0) {
      throw new Error("No response from push");
    }
    return fromPushRes(res[0]);
  }

  @Query(() => FetchRes)
  async fetchRemote(@Args() args: RemoteArgs): Promise<FetchRes> {
    const conn = this.conn.connection();
    const res = await conn.callFetchRemote(args);
    if (res.length === 0) {
      throw new Error("No response from fetch");
    }
    return fromFetchRes(res[0]);
  }

  // Determine the number of commits by which the local branch is ahead or behind the remote branch:
  // 1. Identify the merge base of the two branches.
  // 2. Calculate the 'ahead' count as the number of commits on the local branch that come after the merge base.
  // 3. Calculate the 'behind' count as the number of commits on the remote branch that come after the merge base.
  @Query(() => RemoteBranchDiffCounts)
  async remoteBranchDiffCounts(
    @Args() args: RemoteBranchDiffCountsArgs,
  ): Promise<RemoteBranchDiffCounts> {
    const conn = this.conn.connection();
    const mergeBase = await conn.getMergeBase(args);
    const aheadLogs = await conn.getTwoDotLogs({
      toRefName: mergeBase,
      fromRefName: args.toRefName,
      databaseName: args.databaseName,
    });
    const behindLogs = await conn.getTwoDotLogs({
      toRefName: mergeBase,
      fromRefName: args.fromRefName,
      databaseName: args.databaseName,
    });
    return {
      ahead: aheadLogs.length,
      behind: behindLogs.length,
    };
  }
}
