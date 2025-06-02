import {
  Field,
  GraphQLTimestamp,
  ID,
  ObjectType,
  createUnionType,
} from "@nestjs/graphql";

@ObjectType()
export class PullDetailCommit {
  @Field(() => ID)
  _id: string;

  @Field()
  username: string;

  @Field()
  message: string;

  @Field(() => GraphQLTimestamp)
  createdAt: Date;

  @Field()
  commitId: string;

  @Field({ nullable: true })
  parentCommitId?: string;
}

@ObjectType()
export class PullDetailSummary {
  @Field(() => ID)
  _id: string;

  @Field()
  username: string;

  @Field(() => GraphQLTimestamp)
  createdAt: Date;

  @Field()
  numCommits: number;
}

export const PullDetailUnion = createUnionType({
  name: "PullDetails",
  types: () => [PullDetailSummary, PullDetailCommit],
  resolveType: value => {
    if ("commitId" in value) {
      return PullDetailCommit;
    }
    if ("numCommits" in value) {
      return PullDetailSummary;
    }
    return undefined;
  },
});

export type PullDetail = typeof PullDetailUnion;
export type PullDetails = PullDetail[];
