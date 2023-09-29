import {
  Args,
  ArgsType,
  Field,
  Mutation,
  Query,
  Resolver,
} from "@nestjs/graphql";
import { DataSourceService } from "../dataSources/dataSource.service";

@ArgsType()
class AddDatabaseConnectionArgs {
  @Field()
  url: string;
}

@Resolver()
export class DatabaseResolver {
  constructor(private readonly dss: DataSourceService) {}

  @Query(_returns => String, { nullable: true })
  async currentDatabase(): Promise<string | undefined> {
    const database = await this.dss.getDS().query(`SELECT DATABASE()`);
    return database[0]["DATABASE()"];
  }

  @Mutation(_returns => Boolean)
  async addDatabaseConnection(
    @Args() args: AddDatabaseConnectionArgs,
  ): Promise<boolean> {
    await this.dss.addDS(args.url);
    return true;
  }
}
