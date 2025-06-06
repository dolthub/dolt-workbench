import { Field, ObjectType } from "@nestjs/graphql";
import { SchemaType } from "./schema.enums";

@ObjectType()
export class SchemaItem {
  @Field()
  name: string;

  @Field(() => SchemaType)
  type: SchemaType;
}
