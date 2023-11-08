import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import { DataSourceService } from "../dataSources/dataSource.service";
import { CommitDiffType } from "../diffSummaries/diffSummary.enums";
import { DBArgs } from "../utils/commonTypes";
import { SchemaDiff, fromDoltSchemaDiffRows } from "./schemaDiff.model";
import {
  schemaDiffQuery,
  schemaPatchQuery,
  threeDotSchemaPatchQuery,
} from "./schemaDiff.queries";

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
        if (args.type === CommitDiffType.ThreeDot) {
          const commitArgs = [
            `${args.toRefName}...${args.fromRefName}`,
            args.tableName,
          ];
          const patchRes = await query(threeDotSchemaPatchQuery, commitArgs);
          const diffRes = await query(schemaDiffQuery, commitArgs);
          return fromDoltSchemaDiffRows(patchRes, diffRes);
        }

        const commitArgs = [args.fromRefName, args.toRefName, args.tableName];
        const patchRes = await query(schemaPatchQuery, commitArgs);
        const diffRes = await query(schemaDiffQuery, commitArgs);
        return fromDoltSchemaDiffRows(patchRes, diffRes);
      },
      args.databaseName,
      args.refName,
    );
  }
}
