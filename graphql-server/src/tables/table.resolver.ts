import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import { ConnectionResolver } from "../connections/connection.resolver";
import { ParQuery } from "../dataSources/dataSource.service";
import { handleTableNotFound } from "../dataSources/utils";
import { systemTableValues } from "../systemTables/systemTable.enums";
import { RefArgs, TableArgs } from "../utils/commonTypes";
import { Table, TableNames, fromDoltRowRes } from "./table.model";
import {
  columnsQuery,
  foreignKeysQuery,
  indexQuery,
  listTablesQuery,
} from "./table.queries";
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
    return conn.queryMaybeDolt(
      async (q, isDolt) => getTableInfo(q, args, isDolt),
      args.databaseName,
      args.refName,
    );
  }

  @Query(_returns => TableNames)
  async tableNames(@Args() args: ListTableArgs): Promise<TableNames> {
    const conn = this.conn.connection();
    return conn.queryMaybeDolt(
      async (q, isDolt) => getTableNames(q, args, isDolt),
      args.databaseName,
      args.refName,
    );
  }

  @Query(_returns => [Table])
  async tables(@Args() args: ListTableArgs): Promise<Table[]> {
    const conn = this.conn.connection();
    return conn.queryMaybeDolt(
      async (q, isDolt) => {
        const tableNames = await getTableNames(q, args, isDolt);
        const tables = await Promise.all(
          tableNames.list.map(async name =>
            getTableInfo(q, { ...args, tableName: name }, isDolt),
          ),
        );
        return tables;
      },
      args.databaseName,
      args.refName,
    );
  }

  // Utils
  async maybeTable(@Args() args: TableArgs): Promise<Table | undefined> {
    return handleTableNotFound(async () => this.table(args));
  }
}

async function getTableNames(
  query: ParQuery,
  args: ListTableArgs,
  isDolt: boolean,
): Promise<TableNames> {
  const tables = await query(listTablesQuery);
  const mapped = mapTablesRes(tables);

  if (args.filterSystemTables ?? !isDolt) return { list: mapped };

  // Add system tables if filter is false
  const systemTables = await getSystemTables(query);
  return { list: [...mapped, ...systemTables] };
}

async function getTableInfo(
  query: ParQuery,
  args: TableArgs,
  isDolt: boolean,
): Promise<Table> {
  const columns = await query(columnsQuery, [args.tableName]);
  const fkRows = await query(foreignKeysQuery, [
    args.tableName,
    isDolt ? `${args.databaseName}/${args.refName}` : args.databaseName,
  ]);
  const idxRows = await query(indexQuery, [args.tableName]);
  return fromDoltRowRes(
    args.databaseName,
    args.refName,
    args.tableName,
    columns,
    fkRows,
    idxRows,
  );
}

export async function getSystemTables(query: ParQuery): Promise<string[]> {
  const systemTables = await Promise.all(
    systemTableValues.map(async st => {
      const cols = await handleTableNotFound(async () =>
        query(columnsQuery, [st]),
      );
      if (cols) return `${st}`;
      return undefined;
    }),
  );
  return systemTables.filter(st => !!st) as string[];
}
