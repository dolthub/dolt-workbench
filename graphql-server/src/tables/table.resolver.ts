import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import { ConnectionProvider } from "../connections/connection.provider";
import { handleTableNotFound } from "../utils";
import { RefArgs, TableArgs } from "../utils/commonTypes";
import { Table, TableNames, fromDoltRowRes } from "./table.model";

@ArgsType()
class ListTableArgs extends RefArgs {
  @Field({ nullable: true })
  filterSystemTables?: boolean;
}

@Resolver(_of => Table)
export class TableResolver {
  constructor(private readonly conn: ConnectionProvider) {}

  @Query(_returns => Table)
  async table(@Args() args: TableArgs): Promise<Table> {
    const conn = this.conn.connection();
    const res = await conn.getTableInfo(args);
    if (!res) {
      throw new Error("no such table in database");
    }
    return fromDoltRowRes(args.databaseName, args.refName, res);
  }

  @Query(_returns => TableNames)
  async tableNames(@Args() args: ListTableArgs): Promise<TableNames> {
    const conn = this.conn.connection();
    const res = await conn.getTableNames(args, args.filterSystemTables);
    return { list: res };
  }

  @Query(_returns => [Table])
  async tables(@Args() args: ListTableArgs): Promise<Table[]> {
    const conn = this.conn.connection();
    const tableNames = await conn.getTableNames(args, args.filterSystemTables);
    const res = await conn.getTables(args, tableNames);
    return res.map(t => fromDoltRowRes(args.databaseName, args.refName, t));
  }

  // Utils
  async maybeTable(@Args() args: TableArgs): Promise<Table | undefined> {
    return handleTableNotFound(async () => this.table(args));
  }
}
