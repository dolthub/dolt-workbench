import { Field, ID, ObjectType } from "@nestjs/graphql";
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
  fastForward: string;

  @Field()
  conflicts: string;

  @Field()
  message: string;
}

@ObjectType()
export class PushRes {
  @Field()
  status: string;

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
    fastForward: r.fast_forward,
    conflicts: r.conflicts,
    message: r.message,
  };
}

export function fromPushRes(r: RawRow): PushRes {
  return {
    status: r.status,
    message: r.message,
  };
}
