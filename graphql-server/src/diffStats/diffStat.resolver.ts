import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import { ConnectionResolver } from "../connections/connection.resolver";
import { CommitDiffType } from "../diffSummaries/diffSummary.enums";
import { DBArgs } from "../utils/commonTypes";
import { DiffStat, fromDoltDiffStat } from "./diffStat.model";

@ArgsType()
export class DiffStatArgs extends DBArgs {
  @Field()
  fromRefName: string;

  @Field()
  toRefName: string;

  @Field({ nullable: true })
  refName?: string;

  @Field(_type => CommitDiffType, { nullable: true })
  type?: CommitDiffType;

  @Field({ nullable: true })
  tableName?: string;
}

@Resolver(_of => DiffStat)
export class DiffStatResolver {
  constructor(private readonly conn: ConnectionResolver) {}

  @Query(_returns => DiffStat)
  async diffStat(@Args() args: DiffStatArgs): Promise<DiffStat> {
    const conn = this.conn.connection();
    const type = args.type ?? CommitDiffType.TwoDot;
    checkArgs(args);

    if (type === CommitDiffType.ThreeDot) {
      const res = await conn.getThreeDotDiffStat(args);
      return fromDoltDiffStat(res);
    }

    const res = await conn.getDiffStat(args);
    return fromDoltDiffStat(res);
  }
}

export function checkArgs(args: DiffStatArgs): void {
  if (
    args.type === CommitDiffType.TwoDot &&
    (isRefKeyword(args.fromRefName) || isRefKeyword(args.toRefName)) &&
    !args.refName
  ) {
    throw new Error("refName is required for TwoDot diff with ref keyword");
  }
}

function isRefKeyword(refName: string): boolean {
  const upper = refName.toUpperCase();
  return upper === "WORKING" || upper === "HEAD" || upper === "STAGED";
}
