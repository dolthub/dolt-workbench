import { Args, ArgsType, Field, Int, Query, Resolver } from "@nestjs/graphql";
import { DataSourceService } from "../dataSources/dataSource.service";
import { ROW_LIMIT, getOrderByFromCols } from "../utils";
import { RawRow } from "../utils/commonTypes";
import { Row, RowList, fromDoltListRowRes } from "./row.model";

@ArgsType()
export class ListRowsArgs {
  @Field()
  tableName: string;

  @Field(_type => Int, { nullable: true })
  offset?: number;
}

@Resolver(_of => Row)
export class RowResolver {
  constructor(private readonly dss: DataSourceService) {}

  @Query(_returns => RowList)
  async rows(@Args() args: ListRowsArgs): Promise<RowList> {
    const columns = await this.dss
      .getDS()
      .query(`DESCRIBE ??`, [args.tableName]);
    const offset = args.offset ?? 0;
    const { cols, pkLen } = getPKColsForRowsQuery(columns);
    const rows = await this.dss
      .getDS()
      .query(`SELECT * FROM ?? ${getOrderByFromCols(pkLen)}LIMIT ? OFFSET ?`, [
        args.tableName,
        ...cols,
        ROW_LIMIT + 1,
        offset,
      ]);
    return fromDoltListRowRes(rows, offset);
  }
}

function getPKColsForRowsQuery(cs: RawRow[]): {
  cols: string[];
  pkLen: number;
} {
  const pkCols = cs.filter(col => col.Key === "PRI");
  const cols = pkCols.map(c => c.Field);
  return { pkLen: pkCols.length, cols };
}
