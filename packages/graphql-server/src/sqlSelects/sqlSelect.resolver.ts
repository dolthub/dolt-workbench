import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import { DataSourceService } from "../dataSources/dataSource.service";
import { SqlSelect, fromSqlSelectRow } from "./sqlSelect.model";

@ArgsType()
export class SqlSelectArgs {
  @Field()
  queryString: string;
}

@Resolver(_of => SqlSelect)
export class SqlSelectResolver {
  constructor(private readonly dss: DataSourceService) {}

  @Query(_returns => SqlSelect)
  async sqlSelect(@Args() args: SqlSelectArgs): Promise<SqlSelect> {
    const res = await this.dss.getDS().query(args.queryString);
    return fromSqlSelectRow(res, args.queryString);
  }
}
