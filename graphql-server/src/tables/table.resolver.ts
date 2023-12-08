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
    if (!res.length) throw new Error("Table not found");
    return fromDoltRowRes(
      args.databaseName,
      args.refName,
      args.tableName,
      res[0].columns,
      res[0].fkRows,
      res[0].idxRows,
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

// async function getTableNames(
//   query: ParQuery,
//   args: ListTableArgs,
//   isDolt: boolean,
// ): Promise<TableNames> {
//   const tables = await query(listTablesQuery);
//   const mapped = mapTablesRes(tables);

//   if (args.filterSystemTables ?? !isDolt) return { list: mapped };

//   // Add system tables if filter is false
//   const systemTables = await getSystemTables(query);
//   return { list: [...mapped, ...systemTables] };
// }

// async function getTableInfo(
//   query: ParQuery,
//   args: TableArgs,
//   isDolt: boolean,
// ): Promise<Table> {
//   const columns = await query(columnsQuery, [args.tableName]);
//   const fkRows = await query(foreignKeysQuery, [
//     args.tableName,
//     isDolt ? `${args.databaseName}/${args.refName}` : args.databaseName,
//   ]);
//   const idxRows = await query(indexQuery, [args.tableName]);
//   return fromDoltRowRes(
//     args.databaseName,
//     args.refName,
//     args.tableName,
//     columns,
//     fkRows,
//     idxRows,
//   );
// }

// export async function getSystemTables(query: ParQuery): Promise<string[]> {
//   const systemTables = await Promise.all(
//     systemTableValues.map(async st => {
//       const cols = await handleTableNotFound(async () =>
//         query(columnsQuery, [st]),
//       );
//       if (cols) return `${st}`;
//       return undefined;
//     }),
//   );
//   return systemTables.filter(st => !!st) as string[];
// }
