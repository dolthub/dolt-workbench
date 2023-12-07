import { Field, GraphQLTimestamp, ID, ObjectType } from "@nestjs/graphql";
import { RawRow } from "../dataSources/types";
import { convertToUTCDate } from "../utils";
import { ListOffsetRes } from "../utils/commonTypes";
import * as doltWriter from "./doltWriter.model";

@ObjectType()
export class Commit {
  @Field(_type => ID)
  _id: string;

  @Field()
  commitId: string;

  @Field()
  databaseName: string;

  @Field()
  message: string;

  @Field(_type => GraphQLTimestamp)
  committedAt: Date;

  @Field(_type => doltWriter.DoltWriter)
  committer: doltWriter.DoltWriter;

  @Field(_type => [String])
  parents: string[];
}

@ObjectType()
export class CommitList extends ListOffsetRes {
  @Field(_type => [Commit])
  list: Commit[];
}

export function fromDoltLogRow(databaseName: string, l: RawRow): Commit {
  const _id = `databases/${databaseName}/commits/${l.commit_hash}`;
  return {
    _id,
    databaseName,
    message: l.message,
    commitId: l.commit_hash,
    committedAt: convertToUTCDate(l.date),
    committer: doltWriter.fromDoltLogRow(l),
    parents: getParents(l),
  };
}

export function getParents(l: RawRow): string[] {
  if (!l.parents) return [];
  return l.parents.split(", ");
}
