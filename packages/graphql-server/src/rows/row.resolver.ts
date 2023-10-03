import { Args, ArgsType, Field, Int, Query, Resolver } from "@nestjs/graphql";
import { DataSourceService } from "../dataSources/dataSource.service";
import { listTablesQuery } from "../tables/table.queries";
import { ROW_LIMIT } from "../utils";
import { DBArgs } from "../utils/commonTypes";
import { Row, RowList, fromDoltListRowRes } from "./row.model";
import { getRowsQuery } from "./row.queries";

@ArgsType()
export class ListRowsArgs extends DBArgs {
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
    return this.dss.query(async query => {
      const columns = await query(listTablesQuery, [args.tableName]);
      const offset = args.offset ?? 0;
      const { q, cols } = getRowsQuery(columns);
      const rows = await query(q, [
        args.tableName,
        ...cols,
        ROW_LIMIT + 1,
        offset,
      ]);
      return fromDoltListRowRes(rows, offset);
    }, args.databaseName);
  }
}
