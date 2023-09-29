import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import { DataSourceService } from "../dataSources/dataSource.service";
import { Table, TableNames, fromDoltRowRes } from "./table.model";
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
    const ds = this.dss.getDS();
    const columns = await ds.query(`DESCRIBE ??`, [args.tableName]);
    const fkRows = await ds.query(
      `SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE table_name=? AND referenced_table_schema IS NOT NULL`,
      [args.tableName],
    );
    const idxRows = await ds.query(
      `SELECT 
  table_name, index_name, comment, non_unique, GROUP_CONCAT(column_name ORDER BY seq_in_index) AS COLUMNS 
FROM information_schema.statistics 
WHERE table_name=? AND index_name!="PRIMARY" 
GROUP BY index_name;`,
      [args.tableName],
    );

    return fromDoltRowRes(args.tableName, columns, fkRows, idxRows);
  }

  @Query(_returns => TableNames)
  async tableNames(): Promise<TableNames> {
    const tables = await this.dss
      .getDS()
      .query(`SHOW FULL TABLES WHERE table_type = 'BASE TABLE'`);
    const mapped = mapTablesRes(tables);

    return { list: mapped };
  }

  @Query(_returns => [Table])
  async tables(): Promise<Table[]> {
    const tableNames = await this.tableNames();
    const tables = await Promise.all(
      tableNames.list.map(async name => this.table({ tableName: name })),
    );
    return tables;
  }
}
