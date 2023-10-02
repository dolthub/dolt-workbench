import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import { DataSourceService, ParQuery } from "../dataSources/dataSource.service";
import { Table, TableNames, fromDoltRowRes } from "./table.model";
import {
  columnsQuery,
  foreignKeysQuery,
  indexQuery,
  listTablesQuery,
} from "./table.queries";
import { mapTablesRes } from "./utils";

@ArgsType()
class GetTableArgs {
  @Field()
  tableName: string;
}

@Resolver(_of => Table)
export class TableResolver {
  constructor(private readonly dss: DataSourceService) {}

  @Query(_returns => Table)
  async table(@Args() args: GetTableArgs): Promise<Table> {
    return this.dss.query(async q => getTableInfo(q, args.tableName));
  }

  @Query(_returns => TableNames)
  async tableNames(): Promise<TableNames> {
    return this.dss.query(getTableNames);
  }

  @Query(_returns => [Table])
  async tables(): Promise<Table[]> {
    return this.dss.query(async q => {
      const tableNames = await getTableNames(q);
      const tables = await Promise.all(
        tableNames.list.map(async name => getTableInfo(q, name)),
      );
      return tables;
    });
  }
}

async function getTableNames(query: ParQuery): Promise<TableNames> {
  const tables = await query(listTablesQuery);
  const mapped = mapTablesRes(tables);

  return { list: mapped };
}

async function getTableInfo(
  query: ParQuery,
  tableName: string,
): Promise<Table> {
  const columns = await query(columnsQuery, [tableName]);
  const fkRows = await query(foreignKeysQuery, [tableName]);
  const idxRows = await query(indexQuery, [tableName]);
  return fromDoltRowRes(tableName, columns, fkRows, idxRows);
}
