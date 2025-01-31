import { Field, ObjectType } from "@nestjs/graphql";
import { DatabaseType } from "./database.enum";

@ObjectType()
export class DatabaseConnection {
  @Field()
  connectionUrl: string;

  @Field()
  connectionName: string;

  @Field({ nullable: true })
  hideDoltFeatures?: boolean;

  @Field({ nullable: true })
  useSSL?: boolean;

  @Field(_type => DatabaseType, { nullable: true })
  type?: DatabaseType;

  @Field({ nullable: true })
  isDolt?: boolean;
}
