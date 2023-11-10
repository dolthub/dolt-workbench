import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import { DataSourceService, ParQuery } from "../dataSources/dataSource.service";
import { checkArgs } from "../diffStats/diffStat.resolver";
import { DBArgs } from "../utils/commonTypes";
import { CommitDiffType } from "./diffSummary.enums";
import { DiffSummary, fromDoltDiffSummary } from "./diffSummary.model";
import {
  getDiffSummaryQuery,
  getThreeDotDiffSummaryQuery,
} from "./diffSummary.queries";

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
  constructor(private readonly dss: DataSourceService) {}

  @Query(_returns => [DiffSummary])
  async diffSummaries(@Args() args: DiffSummaryArgs): Promise<DiffSummary[]> {
    return this.dss.query(
      async q => getDiffSummaries(q, args),
      args.databaseName,
    );
  }
}

export async function getDiffSummaries(
  query: ParQuery,
  args: DiffSummaryArgs,
): Promise<DiffSummary[]> {
  const type = args.type ?? CommitDiffType.TwoDot;
  checkArgs(args);

  if (type === CommitDiffType.ThreeDot) {
    const res = await query(getThreeDotDiffSummaryQuery(!!args.tableName), [
      `${args.toRefName}...${args.fromRefName}`,
      args.tableName,
    ]);
    return res.map(fromDoltDiffSummary).sort(sortByTableName);
  }

  const res = await query(getDiffSummaryQuery(!!args.tableName), [
    args.fromRefName,
    args.toRefName,
    args.tableName,
  ]);
  return res.map(fromDoltDiffSummary).sort(sortByTableName);
}

function sortByTableName(a: DiffSummary, b: DiffSummary) {
  if (a.toTableName.length && b.toTableName.length) {
    return a.toTableName.localeCompare(b.toTableName);
  }
  return a.fromTableName.localeCompare(b.fromTableName);
}
