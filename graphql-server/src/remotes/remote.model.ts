import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { __Type } from "graphql";
import { getNextOffset, ROW_LIMIT } from "../utils";
import { RawRow } from "../queryFactory/types";
import { DBArgsWithOffset, ListOffsetRes } from "../utils/commonTypes";

@ObjectType()
export class Remote {
  @Field(_type => ID)
  _id: string;

  @Field()
  name: string;

  @Field()
  url: string;

  @Field(_type => [String], { nullable: true })
  fetchSpecs?: string[];
}

@ObjectType()
export class RemoteList extends ListOffsetRes {
  @Field(_type => [Remote])
  list: Remote[];
}

@ObjectType()
export class PullRes {
  @Field()
  fastForward: boolean;

  @Field(_type => Int)
  conflicts: number;

  @Field()
  message: string;
}

@ObjectType()
export class PushRes {
  @Field()
  success: boolean;

  @Field()
  message: string;
}

export function fromDoltRemotesRow(databaseName: string, r: RawRow): Remote {
  return {
    _id: `databases/${databaseName}/remotes/${r.name}`,
    name: r.name,
    url: r.url,
    fetchSpecs: r.fetch_specs,
  };
}

export function getRemoteListRes(
  remotes: RawRow[],
  args: DBArgsWithOffset,
): RemoteList {
  return {
    list: remotes
      .slice(0, ROW_LIMIT)
      .map(l => fromDoltRemotesRow(args.databaseName, l)),
    nextOffset: getNextOffset(remotes.length, args.offset ?? 0),
  };
}

export function fromPullRes(r: RawRow): PullRes {
  return {
    fastForward: r.fast_forward === "1",
    conflicts: parseInt(r.conflicts, 10),
    message: r.message,
  };
}

export function fromPushRes(r: RawRow): PushRes {
  return {
    success: r.status === "0",
    message: r.message,
  };
}
