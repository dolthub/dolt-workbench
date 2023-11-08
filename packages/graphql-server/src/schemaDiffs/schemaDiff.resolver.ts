import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import { DataSourceService } from "../dataSources/dataSource.service";
import { CommitDiffType } from "../diffSummaries/diffSummary.enums";
import { DBArgs } from "../utils/commonTypes";
import { SchemaDiff } from "./schemaDiff.model";
import { schemaDiffQuery, schemaPatchQuery } from "./schemaDiff.queries";

@ArgsType()
class SchemaDiffArgs extends DBArgs {
  @Field()
  fromRefName: string;

  @Field()
  toRefName: string;

  @Field({ nullable: true })
  refName?: string;

  @Field()
  tableName: string;

  @Field(_type => CommitDiffType, { nullable: true })
  type?: CommitDiffType;
}

@Resolver(_of => SchemaDiff)
export class SchemaDiffResolver {
  constructor(private readonly dss: DataSourceService) {}

  @Query(_returns => SchemaDiff, { nullable: true })
  async schemaDiff(
    @Args() args: SchemaDiffArgs,
  ): Promise<SchemaDiff | undefined> {
    return this.dss.query(
      async query => {
        const commitArgs = [args.fromRefName, args.toRefName, args.tableName];
        const res = await query(schemaPatchQuery, commitArgs);
        const schemaPatch = res.map(r => r.statement);

        const diffRes = await query(schemaDiffQuery, commitArgs);
        const schemaDiff = diffRes.length
          ? {
              leftLines: diffRes[0].from_create_statement,
              rightLines: diffRes[0].to_create_statement,
            }
          : undefined;

        return {
          schemaDiff,
          schemaPatch,
        };
      },
      args.databaseName,
      args.refName,
    );
  }
}
