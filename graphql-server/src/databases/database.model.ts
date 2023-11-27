import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class DatabaseConnection {
  @Field()
  connectionUrl: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  hideDoltFeatures?: boolean;

  @Field({ nullable: true })
  useSSL?: boolean;
}
