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
import { getRemoteListRes, Remote, RemoteList } from "./remote.model";

@ArgsType()
export class AddRemoteArgs extends RemoteArgs {
  @Field()
  remoteUrl: string;
}

@ArgsType()
export class PullOrPushRemoteArgs extends RemoteArgs {
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

  @Mutation(_returns => Boolean)
  async pullFromRemote(@Args() args: PullOrPushRemoteArgs): Promise<boolean> {
    const conn = this.conn.connection();
    const res = await conn.callPullRemote(args);
    console.log(res);
    return true;
  }

  @Mutation(_returns => Boolean)
  async pushToRemote(@Args() args: PullOrPushRemoteArgs): Promise<boolean> {
    const conn = this.conn.connection();
    await conn.callPushRemote(args);
    return true;
  }
}
