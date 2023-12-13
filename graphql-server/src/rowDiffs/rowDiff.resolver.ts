import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import { ConnectionResolver } from "../connections/connection.resolver";
import {
  CommitDiffType,
  TableDiffType,
} from "../diffSummaries/diffSummary.enums";
import { getDiffSummaries } from "../diffSummaries/diffSummary.resolver";
import { DBArgsWithOffset } from "../utils/commonTypes";
import { DiffRowType } from "./rowDiff.enums";
import {
  RowDiff,
  RowDiffList,
  fromDoltListRowWithColsRes,
  fromOneSidedTable,
  fromRowDiffRowsWithCols,
} from "./rowDiff.model";

@ArgsType()
class ListRowDiffsArgs extends DBArgsWithOffset {
  @Field()
  fromRefName: string;

  @Field()
  toRefName: string;

  @Field({ nullable: true })
  refName?: string;

  @Field()
  tableName: string;

  @Field(_type => DiffRowType, { nullable: true })
  filterByRowType?: DiffRowType;

  @Field(_type => CommitDiffType, { nullable: true })
  type?: CommitDiffType;
}

@Resolver(_of => RowDiff)
export class RowDiffResolver {
  constructor(private readonly conn: ConnectionResolver) {}

  @Query(_returns => RowDiffList)
  async rowDiffs(
    @Args()
    { databaseName, tableName, refName, ...args }: ListRowDiffsArgs,
  ): Promise<RowDiffList> {
    const dbArgs = { databaseName, refName };
    const offset = args.offset ?? 0;
    const conn = this.conn.connection();

    const ds = await getDiffSummaries(conn, {
      ...dbArgs,
      tableName,
      fromRefName: args.fromRefName,
      toRefName: args.toRefName,
      type: args.type,
    });
    if (!ds.length) {
      throw new Error(`Could not get summary for table "${tableName}"`);
    }

    const { fromCommitId, toCommitId } = await conn.resolveRefs({
      ...dbArgs,
      ...args,
    });
    const { tableType, fromTableName, toTableName } = ds[0];

    if (tableType === TableDiffType.Dropped) {
      const { rows, columns } = await conn.getOneSidedRowDiff({
        ...dbArgs,
        tableName,
        refName: fromCommitId,
        offset,
      });
      return fromOneSidedTable(
        fromDoltListRowWithColsRes(rows, columns, offset, tableName),
        "dropped",
        args.filterByRowType,
      );
    }

    if (tableType === TableDiffType.Added) {
      const { rows, columns } = await conn.getOneSidedRowDiff({
        ...dbArgs,
        tableName,
        refName: toCommitId,
        offset,
      });
      return fromOneSidedTable(
        fromDoltListRowWithColsRes(rows, columns, offset, tableName),
        "added",
        args.filterByRowType,
      );
    }

    const { colsUnion, diff } = await conn.getRowDiffs({
      ...dbArgs,
      tableName,
      fromTableName,
      toTableName,
      fromCommitId,
      toCommitId,
      offset,
      filterByRowType: args.filterByRowType,
    });

    return fromRowDiffRowsWithCols(tableName, colsUnion, diff, offset);
  }
}
