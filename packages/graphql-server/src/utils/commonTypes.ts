import { ArgsType, Field, Int, ObjectType } from "@nestjs/graphql";

export type RawRow = Record<string, any>;
export type RawRows = RawRow[];

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
export class TableArgs extends RefArgs {
  @Field()
  tableName: string;
}

@ArgsType()
export class DBArgsWithOffset extends DBArgs {
  @Field(_type => Int, { nullable: true })
  offset?: number;
}
