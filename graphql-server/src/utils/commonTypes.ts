import { ArgsType, Field, InputType, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ListOffsetRes {
  @Field(_type => Int, { nullable: true })
  nextOffset?: number;
}

@ArgsType()
export class DBArgs {
  @Field()
  databaseName: string;
}

@ArgsType()
export class CloneArgs extends DBArgs {
  @Field()
  ownerName: string;
}

@ArgsType()
export class SchemaArgs extends DBArgs {
  @Field()
  schemaName: string;
}

@ArgsType()
export class BranchArgs extends DBArgs {
  @Field()
  branchName: string;
}

@ArgsType()
export class RefArgs extends DBArgs {
  @Field()
  refName: string;
}

@ArgsType()
export class RefSchemaArgs extends RefArgs {
  @Field()
  schemaName: string;
}

@ArgsType()
export class RefMaybeSchemaArgs extends RefArgs {
  @Field({ nullable: true })
  schemaName?: string;
}

@ArgsType()
export class TableArgs extends RefArgs {
  @Field()
  tableName: string;
}

@ArgsType()
export class TableMaybeSchemaArgs extends TableArgs {
  @Field({ nullable: true })
  schemaName?: string;
}

@ArgsType()
export class DBArgsWithOffset extends DBArgs {
  @Field(_type => Int, { nullable: true })
  offset?: number;
}

@ArgsType()
export class TagArgs extends DBArgs {
  @Field()
  tagName: string;
}

@ArgsType()
export class RemoteArgs extends DBArgs {
  @Field()
  remoteName: string;
}

@InputType()
export class AuthorInfo {
  @Field()
  name: string;

  @Field()
  email: string;
}
