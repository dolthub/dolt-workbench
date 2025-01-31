import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import { ConnectionProvider } from "../connections/connection.provider";
import { checkArgs } from "../diffStats/diffStat.resolver";
import { QueryFactory } from "../queryFactory";
import { DBArgs } from "../utils/commonTypes";
import { CommitDiffType } from "./diffSummary.enums";
import { DiffSummary, fromDoltDiffSummary } from "./diffSummary.model";

@ArgsType()
class DiffSummaryArgs extends DBArgs {
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

@Resolver(_of => DiffSummary)
export class DiffSummaryResolver {
  constructor(private readonly conn: ConnectionProvider) {}

  @Query(_returns => [DiffSummary])
  async diffSummaries(@Args() args: DiffSummaryArgs): Promise<DiffSummary[]> {
    const conn = this.conn.connection(args.connectionName);
    return getDiffSummaries(conn, args);
  }
}

export async function getDiffSummaries(
  conn: QueryFactory,
  args: DiffSummaryArgs,
): Promise<DiffSummary[]> {
  const type = args.type ?? CommitDiffType.TwoDot;
  checkArgs(args);

  if (type === CommitDiffType.ThreeDot) {
    const res = await conn.getThreeDotDiffSummary(args);
    return res.map(fromDoltDiffSummary).sort(sortByTableName);
  }

  const res = await conn.getDiffSummary(args);
  return res.map(fromDoltDiffSummary).sort(sortByTableName);
}

function sortByTableName(a: DiffSummary, b: DiffSummary) {
  if (a.toTableName.length && b.toTableName.length) {
    return a.toTableName.localeCompare(b.toTableName);
  }
  return a.fromTableName.localeCompare(b.fromTableName);
}
