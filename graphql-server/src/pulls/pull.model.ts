import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Commit } from "../commits/commit.model";
import getPullDetails from "../pullDetails/getPullDetails";
import { PullDetailUnion, PullDetails } from "../pullDetails/pullDetail.model";
import {
  PullSummary,
  fromAPISummary,
} from "../pullSummaries/pullSummary.model";
import { PullState } from "./pull.enums";

@ObjectType()
export class PullWithDetails {
  @Field(() => ID)
  _id: string;

  @Field(() => PullState)
  state: PullState;

  @Field(() => PullSummary, { nullable: true })
  summary?: PullSummary;

  @Field(() => [PullDetailUnion], { nullable: true })
  details?: PullDetails;
}

export function fromAPIModelPullWithDetails(
  pullId: string,
  commits: Commit[] = [],
): PullWithDetails {
  const summary = fromAPISummary(pullId, commits);
  return {
    _id: `${pullId}/pullWithDetails`,
    state: commits.length ? PullState.Open : PullState.Merged,
    summary,
    details: getPullDetails(summary),
  };
}
