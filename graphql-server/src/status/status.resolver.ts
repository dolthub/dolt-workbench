import { Args, Query, Resolver } from "@nestjs/graphql";
import { DataSourceService } from "../dataSources/dataSource.service";
import { RefArgs } from "../utils/commonTypes";
import { Status, fromStatusRows } from "./status.model";
import { statusQuery } from "./status.queries";

@Resolver(_of => Status)
export class StatusResolver {
  constructor(private readonly dss: DataSourceService) {}

  @Query(_returns => [Status])
  async status(@Args() args: RefArgs): Promise<Status[]> {
    return this.dss.query(
      async query => {
        const res = await query(statusQuery);
        return fromStatusRows(res, args.databaseName, args.refName);
      },
      args.databaseName,
      args.refName,
    );
  }
}
