import { convertToUTCDate } from "@dolthub/web-utils";
import { Field, GraphQLTimestamp, ID, ObjectType } from "@nestjs/graphql";
import * as doltWriter from "../commits/doltWriter.model";
import { RawRow } from "../queryFactory/types";

@ObjectType()
export class Tag {
  @Field(() => ID)
  _id: string;

  @Field()
  tagName: string;

  @Field()
  databaseName: string;

  @Field()
  message: string;

  @Field(() => GraphQLTimestamp)
  taggedAt: Date;

  @Field(() => doltWriter.DoltWriter)
  tagger: doltWriter.DoltWriter;

  @Field()
  commitId: string;
}

@ObjectType()
export class TagList {
  @Field(() => [Tag])
  list: Tag[];
}

export function fromDoltRowRes(databaseName: string, tag: RawRow): Tag {
  return {
    _id: `databases/${databaseName}/tags/${tag.tag_name}`,
    databaseName,
    tagName: tag.tag_name,
    message: tag.message,
    taggedAt: convertToUTCDate(tag.date),
    commitId: tag.tag_hash,
    tagger: {
      _id: tag.email,
      displayName: tag.tagger,
      emailAddress: tag.email,
    },
  };
}
