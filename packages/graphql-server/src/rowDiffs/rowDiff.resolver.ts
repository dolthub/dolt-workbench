import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import * as column from "../columns/column.model";
import { DataSourceService, ParQuery } from "../dataSources/dataSource.service";
import { TableDiffType } from "../diffSummaries/diffSummary.enums";
import { getDiffSummaries } from "../diffSummaries/diffSummary.resolver";
import { ListRowsArgs } from "../rows/row.resolver";
import { ROW_LIMIT } from "../utils";
import { DBArgsWithOffset } from "../utils/commonTypes";
import { DiffRowType, convertToStringForQuery } from "./rowDiff.enums";
import {
  RowDiff,
  RowDiffList,
  fromDoltListRowWithColsRes,
  fromOneSidedTable,
  fromRowDiffRowsWithCols,
} from "./rowDiff.model";
import {
  getRowsQueryAsOf,
  getTableCommitDiffQuery,
  tableColsQueryAsOf,
} from "./rowDiff.queries";
import { unionCols } from "./utils";

@ArgsType()
class ListRowDiffsArgs extends DBArgsWithOffset {
  // Uses resolved commits
  @Field()
  fromCommitId: string;

  @Field()
  toCommitId: string;

  @Field({ nullable: true })
  refName?: string;

  @Field()
  tableName: string;

  @Field(_type => DiffRowType, { nullable: true })
  filterByRowType?: DiffRowType;
}

@Resolver(_of => RowDiff)
export class RowDiffResolver {
  constructor(private readonly dss: DataSourceService) {}

  @Query(_returns => RowDiffList)
  async rowDiffs(
    @Args()
    { databaseName, tableName, refName, ...args }: ListRowDiffsArgs,
  ): Promise<RowDiffList> {
    const dbArgs = { databaseName, refName };
    const offset = args.offset ?? 0;

    return this.dss.query(
      async query => {
        const ds = await getDiffSummaries(query, {
          ...dbArgs,
          tableName,
          fromRefName: args.fromCommitId,
          toRefName: args.toCommitId,
        });
        if (!ds.length) {
          throw new Error(`Could not get summary for table "${tableName}"`);
        }

        const { tableType, fromTableName, toTableName } = ds[0];

        if (tableType === TableDiffType.Dropped) {
          const rows = await getRowsForDiff(query, {
            ...dbArgs,
            tableName,
            refName: args.fromCommitId,
          });
          return fromOneSidedTable(rows, "dropped", args.filterByRowType);
        }
        if (tableType === TableDiffType.Added) {
          const rows = await getRowsForDiff(query, {
            ...dbArgs,
            tableName,
            refName: args.toCommitId,
          });
          return fromOneSidedTable(rows, "added", args.filterByRowType);
        }

        const oldCols = await query(tableColsQueryAsOf, [
          fromTableName,
          args.fromCommitId,
        ]);
        const newCols = await query(tableColsQueryAsOf, [
          toTableName,
          args.toCommitId,
        ]);

        const colsUnion = unionCols(
          oldCols.map(column.fromDoltRowRes),
          newCols.map(column.fromDoltRowRes),
        );

        const diffType = convertToStringForQuery(args.filterByRowType);
        const refArgs = [args.fromCommitId, args.toCommitId, tableName];
        const pageArgs = [ROW_LIMIT + 1, offset];
        const diffs = await query(
          getTableCommitDiffQuery(colsUnion, !!diffType),
          diffType
            ? [...refArgs, diffType, ...pageArgs]
            : [...refArgs, ...pageArgs],
        );

        return fromRowDiffRowsWithCols(colsUnion, diffs, offset);
      },
      databaseName,
      refName,
    );
  }
}

async function getRowsForDiff(query: ParQuery, args: ListRowsArgs) {
  const columns = await query(tableColsQueryAsOf, [
    args.tableName,
    args.refName,
  ]);
  const offset = args.offset ?? 0;
  const { q, cols } = getRowsQueryAsOf(columns);
  const rows = await query(q, [
    args.tableName,
    args.refName,
    ...cols,
    ROW_LIMIT + 1,
    offset,
  ]);
  return fromDoltListRowWithColsRes(rows, columns, offset);
}
