import { Args, Query, Resolver } from "@nestjs/graphql";
import { DataSourceService } from "../dataSources/dataSource.service";
import { DBArgs } from "../utils/commonTypes";
import { Tag, TagList, fromDoltRowRes } from "./tag.model";
import { tagsQuery } from "./tag.queries";

@Resolver(_of => Tag)
export class TagResolver {
  constructor(private readonly dss: DataSourceService) {}

  @Query(_returns => TagList)
  async tags(@Args() args: DBArgs): Promise<TagList> {
    return this.dss.query(async query => {
      const res = await query(tagsQuery);
      return {
        list: res.map(t => fromDoltRowRes(args.databaseName, t)),
      };
    }, args.databaseName);
  }
}
