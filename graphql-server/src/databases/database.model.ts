import { Field, ObjectType } from "@nestjs/graphql";
import { DatabaseType } from "./database.enum";

@ObjectType()
export class DatabaseConnection {
  @Field()
  connectionUrl: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  port?: string;

  @Field({ nullable: true })
  hideDoltFeatures?: boolean;

  @Field({ nullable: true })
  useSSL?: boolean;

  @Field(() => DatabaseType, { nullable: true })
  type?: DatabaseType;

  @Field({ nullable: true })
  isDolt?: boolean;

  @Field({ nullable: true })
  isLocalDolt?: boolean;
}
