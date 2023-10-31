import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class SchemaItem {
  @Field()
  name: string;

  @Field()
  type: string;
}
