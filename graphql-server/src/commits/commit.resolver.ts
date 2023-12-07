import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import { ConnectionResolver } from "../connections/connection.resolver";
import { ROW_LIMIT, getNextOffset } from "../utils";
import { DBArgsWithOffset, RawRow } from "../utils/commonTypes";
import { Commit, CommitList, fromDoltLogRow } from "./commit.model";

@ArgsType()
export class ListCommitsArgs extends DBArgsWithOffset {
  // either refName or afterCommitId must be set
  @Field({ nullable: true })
  refName?: string;

  @Field({ nullable: true })
  afterCommitId?: string;

  @Field(_type => Boolean, { nullable: true })
  twoDot?: boolean;

  @Field({ nullable: true })
  excludingCommitsFromRefName?: string;
}

@Resolver(_of => Commit)
export class CommitResolver {
  constructor(private readonly conn: ConnectionResolver) {}

  @Query(_returns => CommitList)
  async commits(
    @Args()
    args: ListCommitsArgs,
  ): Promise<CommitList> {
    const err = handleArgsErr(args);
    if (err) throw err;
    const refName = args.refName ?? args.afterCommitId ?? "";
    const offset = args.offset ?? 0;
    const conn = this.conn.connection();

    if (args.twoDot && args.excludingCommitsFromRefName) {
      const logs = await conn.getTwoDotLogs({
        toRefName: args.excludingCommitsFromRefName,
        fromRefName: refName,
        databaseName: args.databaseName,
      });
      return getCommitListRes(logs, args);
    }
    const logs = await conn.getLogs({ ...args, refName }, offset);
    return getCommitListRes(logs, args);
  }
}

function getCommitListRes(logs: RawRow[], args: ListCommitsArgs): CommitList {
  return {
    list: logs
      .slice(0, ROW_LIMIT)
      .map(l => fromDoltLogRow(args.databaseName, l)),
    nextOffset: getNextOffset(logs.length, args.offset ?? 0),
  };
}

function handleArgsErr(args: ListCommitsArgs): Error | undefined {
  if (!args.refName && !args.afterCommitId) {
    return new Error(
      "must supply either `refName` or `afterCommitId` to list commits",
    );
  }
  if (args.refName && args.afterCommitId) {
    return new Error(
      "cannot supply both `refName` and `afterCommitId` when listing commits",
    );
  }
  if (args.twoDot && !args.excludingCommitsFromRefName) {
    return new Error(
      "must supply `excludingCommitsFromRefName` if twoDot is true",
    );
  }
  if (!args.twoDot && args.excludingCommitsFromRefName) {
    return new Error(
      "cannot supply `excludingCommitsFromRefName` if twoDot is not provided or false",
    );
  }
  return undefined;
}
