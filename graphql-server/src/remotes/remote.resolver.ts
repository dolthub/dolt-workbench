import {
  Args,
  ArgsType,
  Field,
  Mutation,
  Query,
  Resolver,
} from "@nestjs/graphql";
import { ConnectionProvider } from "../connections/connection.provider";
import { DBArgsWithOffset, RemoteArgs } from "../utils/commonTypes";
import {
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
  branchName: string;
}

@ArgsType()
export class RemoteMaybeBranchArgs extends RemoteArgs {
  @Field({ nullable: true })
  branchName?: string;
}

@Resolver(_of => Remote)
export class RemoteResolver {
  constructor(private readonly conn: ConnectionProvider) {}

  @Query(_returns => RemoteList)
  async remotes(@Args() args: DBArgsWithOffset): Promise<RemoteList> {
    const conn = this.conn.connection();

    const res = await conn.getRemotes({ ...args, offset: args.offset ?? 0 });
    return getRemoteListRes(res, args);
  }

  @Mutation(_returns => String)
  async addRemote(@Args() args: AddRemoteArgs): Promise<string> {
    const conn = this.conn.connection();
    await conn.addRemote(args);
    return args.remoteName;
  }

  @Mutation(_returns => Boolean)
  async deleteRemote(@Args() args: RemoteArgs): Promise<boolean> {
    const conn = this.conn.connection();
    await conn.callDeleteRemote(args);
    return true;
  }

  @Mutation(_returns => PullRes)
  async pullFromRemote(@Args() args: PullOrPushRemoteArgs): Promise<PullRes> {
    const conn = this.conn.connection();
    const res = await conn.callPullRemote(args);
    if (res.length === 0) {
      throw new Error("No response from pull");
    }
    return fromPullRes(res[0]);
  }

  @Mutation(_returns => PushRes)
  async pushToRemote(@Args() args: PullOrPushRemoteArgs): Promise<PushRes> {
    const conn = this.conn.connection();
    const res = await conn.callPushRemote(args);
    if (res.length === 0) {
      throw new Error("No response from push");
    }
    return fromPushRes(res[0]);
  }

  @Mutation(_returns => FetchRes)
  async fetchRemote(@Args() args: RemoteMaybeBranchArgs): Promise<FetchRes> {
    const conn = this.conn.connection();
    const res = await conn.callFetchRemote(args);
    if (res.length === 0) {
      throw new Error("No response from fetch");
    }
    return fromFetchRes(res[0]);
  }
}
