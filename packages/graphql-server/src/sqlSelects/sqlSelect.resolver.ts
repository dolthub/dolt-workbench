import { Args, ArgsType, Field, Query, Resolver } from "@nestjs/graphql";
import { DataSource } from "typeorm";
import { SqlSelect, fromSqlSelectRow } from "./sqlSelect.model";

@ArgsType()
export class SqlSelectArgs {
  @Field()
  queryString: string;
}

@Resolver(_of => SqlSelect)
export class SqlSelectResolver {
  constructor(private readonly dataSource: DataSource) {}

  @Query(_returns => SqlSelect)
  async sqlSelect(@Args() args: SqlSelectArgs): Promise<SqlSelect> {
    const res = await this.dataSource.query(args.queryString);
    return fromSqlSelectRow(res, args.queryString);
  }
}
