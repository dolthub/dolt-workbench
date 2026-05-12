import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import { ConnectionProvider } from "../connections/connection.provider";
import { CommitDiffType } from "../diffSummaries/diffSummary.enums";
import { ColumnValueInput } from "../rows/rowMutation.resolver";
import {
  SqlSelect,
  fromServerPaginatedRows,
} from "../sqlSelects/sqlSelect.model";
import { TableMaybeSchemaArgs } from "../utils/commonTypes";

@ArgsType()
export class DoltCommitDiffArgs extends TableMaybeSchemaArgs {
  @Field()
  fromCommitId: string;

  @Field()
  toCommitId: string;

  @Field(_type => [String], { nullable: true })
  excludedColumns?: string[];

  @Field(_type => CommitDiffType, { nullable: true })
  type?: CommitDiffType;
}

@ArgsType()
export class DoltCellLookupArgs extends TableMaybeSchemaArgs {
  @Field(_type => [ColumnValueInput])
  pkValues: ColumnValueInput[];

  @Field({ nullable: true })
  columnName?: string;
}

@Resolver()
export class DoltDiffResolver {
  constructor(private readonly conn: ConnectionProvider) {}

  @Query(_returns => SqlSelect)
  async doltCommitDiff(
    @Args() args: DoltCommitDiffArgs,
  ): Promise<SqlSelect> {
    const conn = this.conn.connection();
    const res = await conn.doltCommitDiff(args);
    return fromServerPaginatedRows(
      args.databaseName,
      args.refName,
      res.rows,
      res.executionMessage,
      res.queryString ?? "",
      0,
    );
  }

  @Query(_returns => SqlSelect)
  async doltCellDiff(@Args() args: DoltCellLookupArgs): Promise<SqlSelect> {
    const conn = this.conn.connection();
    const res = await conn.doltCellDiff(args);
    return fromServerPaginatedRows(
      args.databaseName,
      args.refName,
      res.rows,
      res.executionMessage,
      res.queryString ?? "",
      0,
    );
  }

  @Query(_returns => SqlSelect)
  async doltCellHistory(@Args() args: DoltCellLookupArgs): Promise<SqlSelect> {
    const conn = this.conn.connection();
    const res = await conn.doltCellHistory(args);
    return fromServerPaginatedRows(
      args.databaseName,
      args.refName,
      res.rows,
      res.executionMessage,
      res.queryString ?? "",
      0,
    );
  }
}
