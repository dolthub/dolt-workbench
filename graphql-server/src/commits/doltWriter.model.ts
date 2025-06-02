import { Field, ID, ObjectType } from "@nestjs/graphql";
import { RawRow } from "../queryFactory/types";

@ObjectType()
export class DoltWriter {
  @Field(() => ID)
  _id: string;

  @Field()
  displayName: string;

  @Field()
  emailAddress: string;

  @Field({ nullable: true })
  username?: string;
}

export function fromDoltLogRow(l: RawRow): DoltWriter {
  const { committer, email } = l;
  const result: DoltWriter = {
    displayName: committer ?? "User",
    emailAddress: email,
    username: committer,
    _id: email,
  };
  return result;
}
