import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class TextDiff {
  @Field()
  leftLines: string;

  @Field()
  rightLines: string;
}

@ObjectType()
export class SchemaDiff {
  @Field(_type => TextDiff, { nullable: true })
  schemaDiff?: TextDiff;

  @Field(_type => [String], { nullable: true })
  schemaPatch?: string[];

  @Field(_type => Int, { nullable: true })
  numChangedSchemas?: number;
}
