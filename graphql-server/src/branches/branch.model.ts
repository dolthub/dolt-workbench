import { convertToUTCDate } from "@dolthub/web-utils";
import { Field, GraphQLTimestamp, ID, ObjectType } from "@nestjs/graphql";
import { RawRow } from "../queryFactory/types";
import * as table from "../tables/table.model";
import { ListOffsetRes } from "../utils/commonTypes";

@ObjectType()
export class Branch {
  @Field(_type => ID)
  _id: string;

  @Field()
  name: string;

  @Field()
  databaseName: string;

  @Field()
  branchName: string;

  @Field()
  lastCommitter: string;

  @Field(_type => GraphQLTimestamp)
  lastUpdated: Date;

  @Field(_type => table.Table, { nullable: true })
  table?: table.Table;

  @Field(_type => [String])
  tableNames: string[];

  @Field({ nullable: true })
  head?: string;

  @Field({ nullable: true })
  remote?: string;

  @Field({ nullable: true })
  remoteBranch?: string;
}

@ObjectType()
export class BranchList extends ListOffsetRes {
  @Field(_type => [Branch])
  list: Branch[];
}

export function fromDoltBranchesRow(
  name: string,
  databaseName: string,
  b: RawRow,
  tns: string[] = [],
): Branch {
  return {
    _id: `databases/${databaseName}/branches/${b.name}`,
    name,
    databaseName,
    branchName: b.name,
    head: b.hash,
    lastUpdated: convertToUTCDate(b.latest_commit_date),
    lastCommitter: b.latest_committer,
    tableNames: tns,
    remote: b.remote,
    remoteBranch: b.branch,
  };
}

export const branchForNonDoltDB = (
  name: string,
  databaseName: string,
): Branch => {
  const branchName = "main";
  return {
    _id: `databases/${databaseName}/branches/${branchName}`,
    name,
    databaseName,
    branchName,
    lastUpdated: new Date(),
    lastCommitter: "",
    tableNames: [],
  };
};
