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
