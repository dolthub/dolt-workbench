import { Field, ID, ObjectType } from "@nestjs/graphql";
import { RawRow } from "src/queryFactory/types";
import { ListOffsetRes } from "src/utils/commonTypes";

@ObjectType()
export class Remote {
  @Field(_type => ID)
  _id: string;

  @Field()
  name: string;

  @Field()
  url: string;

  @Field(_type => [String])
  fetchSpecs: string[];
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
