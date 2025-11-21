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

  @Field(_type => DatabaseType, { nullable: true })
  type?: DatabaseType;

  @Field({ nullable: true })
  isDolt?: boolean;

  @Field({ nullable: true })
  isLocalDolt?: boolean;

  @Field({ nullable: true })
  certificateAuthority?: string;

  @Field({ nullable: true })
  clientCert?: string;

  @Field({ nullable: true })
  clientKey?: string;
}
