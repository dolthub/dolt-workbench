import { Args, ArgsType, Field, Int, Query, Resolver } from "@nestjs/graphql";
import { handleTableNotFound } from "src/tables/table.resolver";
import { DataSourceService } from "../dataSources/dataSource.service";
import { DoltSystemTable } from "../systemTables/systemTable.enums";
import { listTablesQuery } from "../tables/table.queries";
import { ROW_LIMIT } from "../utils";
import { RefArgs } from "../utils/commonTypes";
import { Row, RowList, fromDoltListRowRes } from "./row.model";
import { getRowsQuery } from "./row.queries";

@ArgsType()
export class ListRowsArgs extends RefArgs {
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
    return this.dss.queryMaybeDolt(
      async query => {
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
      },
      args.databaseName,
      args.refName,
    );
  }

  @Query(_returns => RowList)
  async doltSchemas(
    @Args() args: RefArgs,
    type?: string,
  ): Promise<RowList | undefined> {
    return this.dss.queryMaybeDolt(
      async query => {
        const tableName = DoltSystemTable.SCHEMAS;
        const columns = await query(listTablesQuery, [tableName]);

        const page = { columns, offset: 0 };
        const { q, cols } = getRowsQuery(columns, !!type);

        const params = [...cols, ROW_LIMIT + 1, page.offset];
        const rows = await query(
          q,
          type ? [tableName, type, ...params] : [tableName, ...params],
        );
        return fromDoltListRowRes(rows, page.offset);
      },
      args.databaseName,
      args.refName,
    );
  }

  @Query(_returns => RowList)
  async views(@Args() args: RefArgs): Promise<RowList | undefined> {
    return this.doltSchemas(args, "view");
  }

  @Query(_returns => RowList, { nullable: true })
  async doltProcedures(@Args() args: RefArgs): Promise<RowList | undefined> {
    const tableArgs = {
      ...args,
      tableName: DoltSystemTable.PROCEDURES,
    };
    return handleTableNotFound(async () => this.rows(tableArgs));
  }
}
