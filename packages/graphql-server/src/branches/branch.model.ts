import { Field, GraphQLTimestamp, ID, ObjectType } from "@nestjs/graphql";
import * as table from "../tables/table.model";
import { convertToUTCDate } from "../utils";
import { RawRow } from "../utils/commonTypes";

@ObjectType()
export class Branch {
  @Field(_type => ID)
  _id: string;

  @Field()
  databaseName: string;

  @Field()
  branchName: string;

  @Field(_type => GraphQLTimestamp)
  lastUpdated: Date;

  @Field(_type => table.Table, { nullable: true })
  table?: table.Table;

  @Field(_type => [String])
  tableNames: string[];

  @Field({ nullable: true })
  head?: string;
}

@ObjectType()
export class BranchNamesList {
  @Field(_type => [Branch])
  list: Branch[];
}

export function fromDoltBranchesRow(
  databaseName: string,
  b: RawRow,
  tns: string[] = [],
): Branch {
  return {
    _id: `databases/${databaseName}/branches/${b.name}`,
    databaseName,
    branchName: b.name,
    head: b.head,
    lastUpdated: convertToUTCDate(b.latest_commit_date),
    tableNames: tns,
  };
}
