import { Field, ID, ObjectType } from "@nestjs/graphql";
import * as commit from "../commits/commit.model";

@ObjectType()
export class PullSummary {
  @Field(_type => ID)
  _id: string;

  @Field(_type => commit.CommitList)
  commits: commit.CommitList;
}

export function fromAPISummary(
  _pullId: string,
  commits: commit.Commit[],
): PullSummary {
  return {
    _id: `${_pullId}/summary`,
    commits: { list: commits },
  };
}
