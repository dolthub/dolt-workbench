import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import { ConnectionResolver } from "../connections/connection.resolver";
import { handleTableNotFound } from "../utils";
import { RefArgs, TableArgs } from "../utils/commonTypes";
import { Table, TableNames, fromDoltRowRes } from "./table.model";
import { mapTablesRes } from "./utils";

@ArgsType()
class ListTableArgs extends RefArgs {
  @Field({ nullable: true })
  filterSystemTables?: boolean;
}

@Resolver(_of => Table)
export class TableResolver {
  constructor(private readonly conn: ConnectionResolver) {}

  @Query(_returns => Table)
  async table(@Args() args: TableArgs): Promise<Table> {
    const conn = this.conn.connection();
    const res = await conn.getTableInfo(args);
    return fromDoltRowRes(
      args.databaseName,
      args.refName,
      args.tableName,
      res.columns,
      res.fkRows,
      res.idxRows,
    );
  }

  @Query(_returns => TableNames)
  async tableNames(@Args() args: ListTableArgs): Promise<TableNames> {
    const conn = this.conn.connection();
    const res = await conn.getTableNames(args, args.filterSystemTables);
    return { list: mapTablesRes(res) };
  }

  @Query(_returns => [Table])
  async tables(@Args() args: ListTableArgs): Promise<Table[]> {
    const conn = this.conn.connection();
    const tableNames = await conn.getTableNames(args, args.filterSystemTables);
    console.log("got tables");
    const res = await conn.getTables(args, mapTablesRes(tableNames));
    return res.map(t =>
      fromDoltRowRes(
        args.databaseName,
        args.refName,
        t.name,
        t.columns,
        t.fkRows,
        t.idxRows,
      ),
    );
  }

  // Utils
  async maybeTable(@Args() args: TableArgs): Promise<Table | undefined> {
    return handleTableNotFound(async () => this.table(args));
  }
}
