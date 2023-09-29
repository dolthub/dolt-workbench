import { Field, Int, ObjectType } from "@nestjs/graphql";

export type RawRow = Record<string, any>;
export type RawRows = RawRow[];

@ObjectType()
export class ListOffsetRes {
  @Field(_type => Int, { nullable: true })
  nextOffset?: number;
}
