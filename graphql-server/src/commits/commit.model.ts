import { convertToUTCDate } from "@dolthub/web-utils";
import { Field, GraphQLTimestamp, ID, ObjectType } from "@nestjs/graphql";
import { RawRow } from "../queryFactory/types";
import { ListOffsetRes } from "../utils/commonTypes";
import * as doltWriter from "./doltWriter.model";

@ObjectType()
export class Commit {
  @Field(() => ID)
  _id: string;

  @Field()
  commitId: string;

  @Field()
  databaseName: string;

  @Field()
  message: string;

  @Field(() => GraphQLTimestamp)
  committedAt: Date;

  @Field(() => doltWriter.DoltWriter)
  committer: doltWriter.DoltWriter;

  @Field(() => [String])
  parents: string[];
}

@ObjectType()
export class CommitList extends ListOffsetRes {
  @Field(() => [Commit])
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
