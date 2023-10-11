import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import { DataSourceService } from "../dataSources/dataSource.service";
import { ROW_LIMIT, getNextOffset } from "../utils";
import { DBArgsWithOffset, RawRow } from "../utils/commonTypes";
import { Commit, CommitList, fromDoltLogRow } from "./commit.model";
import { doltLogsQuery } from "./commit.queries";

@ArgsType()
export class ListCommitsArgs extends DBArgsWithOffset {
  // either refName or afterCommitId must be set
  @Field()
  refName: string;

  // @Field({ nullable: true })
  // afterCommitId?: string;

  // @Field(_type => Boolean, { nullable: true })
  // twoDot?: boolean;

  // @Field({ nullable: true })
  // excludingCommitsFromRefName?: string;

  // @Field(_type => Boolean, { nullable: true })
  // resolveBranchNames?: boolean;
}

@Resolver(_of => Commit)
export class CommitResolver {
  constructor(private readonly dss: DataSourceService) {}

  @Query(_returns => CommitList)
  async commits(
    @Args()
    args: ListCommitsArgs,
  ): Promise<CommitList> {
    const offset = args.offset ?? 0;
    return this.dss.query(async query => {
      const logs = await query(doltLogsQuery, [
        args.refName,
        ROW_LIMIT + 1,
        offset,
      ]);
      return getCommitListRes(logs, args);
    }, args.databaseName);
  }
}

function getCommitListRes(logs: RawRow[], args: ListCommitsArgs): CommitList {
  return {
    list: logs
      .slice(0, ROW_LIMIT)
      .map(l => fromDoltLogRow(args.databaseName, l)),
    nextOffset: getNextOffset(logs.length, args.offset ?? 0),
  };
}
