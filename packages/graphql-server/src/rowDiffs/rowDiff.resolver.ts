import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import * as column from "../columns/column.model";
import { DataSourceService, ParQuery } from "../dataSources/dataSource.service";
import {
  CommitDiffType,
  TableDiffType,
} from "../diffSummaries/diffSummary.enums";
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
  hashOf,
  mergeBase,
  tableColsQueryAsOf,
} from "./rowDiff.queries";
import { unionCols } from "./utils";

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
          fromRefName: args.fromRefName,
          toRefName: args.toRefName,
          type: args.type,
        });
        if (!ds.length) {
          throw new Error(`Could not get summary for table "${tableName}"`);
        }

        const { fromCommitId, toCommitId } = await resolveRefs(
          query,
          args.fromRefName,
          args.toRefName,
          args.type,
        );

        const { tableType, fromTableName, toTableName } = ds[0];
        console.log("from", args.fromRefName, "to", args.toRefName);
        console.log("DIFF TYPE", ds[0]);
        if (tableType === TableDiffType.Dropped) {
          // console.log("dropped", tableName, args.fromRefName);
          const rows = await getRowsForDiff(query, {
            ...dbArgs,
            tableName,
            refName: args.toRefName,
          });
          return fromOneSidedTable(rows, "dropped", args.filterByRowType);
        }
        if (tableType === TableDiffType.Added) {
          const rows = await getRowsForDiff(query, {
            ...dbArgs,
            tableName,
            refName: args.fromRefName,
          });
          return fromOneSidedTable(rows, "added", args.filterByRowType);
        }

        const oldCols = await query(tableColsQueryAsOf, [
          fromTableName,
          fromCommitId,
        ]);
        const newCols = await query(tableColsQueryAsOf, [
          toTableName,
          toCommitId,
        ]);

        const colsUnion = unionCols(
          oldCols.map(c => column.fromDoltRowRes(c, fromTableName)),
          newCols.map(c => column.fromDoltRowRes(c, toTableName)),
        );

        const diffType = convertToStringForQuery(args.filterByRowType);
        const refArgs = [fromCommitId, toCommitId, tableName];
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
  return fromDoltListRowWithColsRes(rows, columns, offset, args.tableName);
}

async function resolveRefs(
  query: ParQuery,
  fromRefName: string,
  toRefName: string,
  type?: CommitDiffType,
): Promise<{ fromCommitId: string; toCommitId: string }> {
  if (type === CommitDiffType.ThreeDot) {
    const fromCommitId = await query(hashOf, [fromRefName]);
    const toCommitId = await query(mergeBase, [toRefName, fromRefName]);
    return {
      fromCommitId: Object.values(fromCommitId[0])[0],
      toCommitId: Object.values(toCommitId[0])[0],
    };
  }
  return { fromCommitId: fromRefName, toCommitId: toRefName };
}
