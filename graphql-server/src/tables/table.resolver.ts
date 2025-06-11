import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import { ConnectionProvider } from "../connections/connection.provider";
import { handleTableNotFound } from "../utils";
import { RefMaybeSchemaArgs, TableMaybeSchemaArgs } from "../utils/commonTypes";
import { Table, TableNames, fromDoltRowRes } from "./table.model";

@ArgsType()
class ListTableArgs extends RefMaybeSchemaArgs {
  @Field({ nullable: true })
  filterSystemTables?: boolean;
}

@Resolver(() => Table)
export class TableResolver {
  constructor(private readonly conn: ConnectionProvider) {}

  @Query(() => Table)
  async table(@Args() args: TableMaybeSchemaArgs): Promise<Table> {
    const conn = this.conn.connection();
    const res = await conn.getTableInfo(args);
    if (!res) {
      throw new Error("no such table in database");
    }
    return fromDoltRowRes(args.databaseName, args.refName, res);
  }

  @Query(() => TableNames)
  async tableNames(@Args() args: ListTableArgs): Promise<TableNames> {
    const conn = this.conn.connection();
    const res = await conn.getTableNames(args, args.filterSystemTables);
    return { list: res };
  }

  @Query(() => [Table])
  async tables(@Args() args: ListTableArgs): Promise<Table[]> {
    const conn = this.conn.connection();
    const tableNames = await conn.getTableNames(args, args.filterSystemTables);
    const res = await conn.getTables(args, tableNames);
    return res.map(t => fromDoltRowRes(args.databaseName, args.refName, t));
  }

  // Utils
  async maybeTable(
    @Args() args: TableMaybeSchemaArgs,
  ): Promise<Table | undefined> {
    return handleTableNotFound(async () => this.table(args));
  }
}
