import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import { DataSourceService } from "../dataSources/dataSource.service";
import { RefArgs } from "../utils/commonTypes";
import { SqlSelect, fromSqlSelectRow } from "./sqlSelect.model";

@ArgsType()
export class SqlSelectArgs extends RefArgs {
  @Field()
  queryString: string;
}

@Resolver(_of => SqlSelect)
export class SqlSelectResolver {
  constructor(private readonly dss: DataSourceService) {}

  @Query(_returns => SqlSelect)
  async sqlSelect(@Args() args: SqlSelectArgs): Promise<SqlSelect> {
    return this.dss.queryMaybeDolt(
      async query => {
        const res = await query(args.queryString);
        return fromSqlSelectRow(
          args.databaseName,
          args.refName,
          res,
          args.queryString,
        );
      },
      args.databaseName,
      args.refName,
    );
  }
}
