import { Args, Query, Resolver } from "@nestjs/graphql";
import { DataSourceService, ParQuery } from "../dataSources/dataSource.service";
import { DBArgs, TableArgs } from "../utils/commonTypes";
import { Table, TableNames, fromDoltRowRes } from "./table.model";
import {
  columnsQuery,
  foreignKeysQuery,
  indexQuery,
  listTablesQuery,
} from "./table.queries";
import { mapTablesRes } from "./utils";

@Resolver(_of => Table)
export class TableResolver {
  constructor(private readonly dss: DataSourceService) {}

  @Query(_returns => Table)
  async table(@Args() args: TableArgs): Promise<Table> {
    return this.dss.query(
      async q => getTableInfo(q, args.databaseName, args.tableName),
      args.databaseName,
    );
  }

  @Query(_returns => TableNames)
  async tableNames(@Args() args: DBArgs): Promise<TableNames> {
    return this.dss.query(async q => getTableNames(q), args.databaseName);
  }

  @Query(_returns => [Table])
  async tables(@Args() args: DBArgs): Promise<Table[]> {
    return this.dss.query(async q => {
      const tableNames = await getTableNames(q);
      const tables = await Promise.all(
        tableNames.list.map(async name =>
          getTableInfo(q, args.databaseName, name),
        ),
      );
      return tables;
    }, args.databaseName);
  }

  // Utils
  async maybeTable(@Args() args: TableArgs): Promise<Table | undefined> {
    return handleTableNotFound(async () => this.table(args));
  }
}

async function getTableNames(query: ParQuery): Promise<TableNames> {
  const tables = await query(listTablesQuery);
  const mapped = mapTablesRes(tables);

  return { list: mapped };
}

async function getTableInfo(
  query: ParQuery,
  databaseName: string,
  tableName: string,
): Promise<Table> {
  const columns = await query(columnsQuery, [tableName]);
  const fkRows = await query(foreignKeysQuery, [tableName]);
  const idxRows = await query(indexQuery, [tableName]);
  return fromDoltRowRes(databaseName, tableName, columns, fkRows, idxRows);
}

export async function handleTableNotFound(
  q: () => Promise<any | undefined>,
): Promise<any | undefined> {
  try {
    const res = await q();
    return res;
  } catch (err) {
    if (err.message.includes("table not found")) {
      return undefined;
    }
    throw err;
  }
}
