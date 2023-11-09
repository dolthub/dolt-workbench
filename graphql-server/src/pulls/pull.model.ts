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
  @Field(_type => ID)
  _id: string;

  @Field(_type => PullState)
  state: PullState;

  @Field(_type => PullSummary, { nullable: true })
  summary?: PullSummary;

  @Field(_type => [PullDetailUnion], { nullable: true })
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
