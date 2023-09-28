import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import { DataSource } from "typeorm";
import { Table, TableNames, fromDoltRowRes } from "./table.model";
import { mapTablesRes } from "./utils";

@ArgsType()
class GetTableArgs {
  @Field()
  tableName: string;
}

@Resolver(_of => Table)
export class TableResolver {
  constructor(private readonly dataSource: DataSource) {}

  @Query(_returns => Table)
  async table(@Args() args: GetTableArgs): Promise<Table> {
    const columns = await this.dataSource.query(`DESCRIBE ??`, [
      args.tableName,
    ]);
    const fkRows = await this.dataSource.query(
      `SELECT * FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE table_name=? AND referenced_table_schema IS NOT NULL`,
      [args.tableName],
    );
    const idxRows = await this.dataSource.query(
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
    const tables = await this.dataSource.query(
      `SHOW FULL TABLES WHERE table_type = 'BASE TABLE'`,
    );
    const mapped = mapTablesRes(tables);

    return { list: mapped };
  }
}
