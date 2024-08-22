import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import { ConnectionProvider } from "../connections/connection.provider";
import { CommitDiffType } from "../diffSummaries/diffSummary.enums";
import { DBArgs } from "../utils/commonTypes";
import { SchemaDiff, fromDoltSchemaDiffRows } from "./schemaDiff.model";

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
  constructor(private readonly conn: ConnectionProvider) {}

  @Query(_returns => SchemaDiff, { nullable: true })
  async schemaDiff(
    @Args() args: SchemaDiffArgs,
  ): Promise<SchemaDiff | undefined> {
    const conn = await this.conn.connection(args.databaseName);

    if (args.type === CommitDiffType.ThreeDot) {
      const patchRes = await conn.getThreeDotSchemaPatch(args);
      const diffRes = await conn.getThreeDotSchemaDiff(args);
      return fromDoltSchemaDiffRows(patchRes, diffRes);
    }

    const patchRes = await conn.getSchemaPatch(args);
    const diffRes = await conn.getSchemaDiff(args);
    return fromDoltSchemaDiffRows(patchRes, diffRes);
  }
}
