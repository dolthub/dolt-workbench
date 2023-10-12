import { Args, Query, Resolver } from "@nestjs/graphql";
import { DataSourceService } from "../dataSources/dataSource.service";
import { DBArgs, TagArgs } from "../utils/commonTypes";
import { Tag, TagList, fromDoltRowRes } from "./tag.model";
import { tagQuery, tagsQuery } from "./tag.queries";

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

  @Query(_returns => Tag, { nullable: true })
  async tag(@Args() args: TagArgs): Promise<Tag | undefined> {
    return this.dss.query(async query => {
      const res = await query(tagQuery, [args.tagName]);
      if (!res.length) return undefined;
      return fromDoltRowRes(args.databaseName, res[0]);
    }, args.databaseName);
  }
}
