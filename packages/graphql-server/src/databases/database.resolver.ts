import { ConfigService } from "@nestjs/config";
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
  @Field({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  useEnv?: boolean;
}

@Resolver()
export class DatabaseResolver {
  constructor(
    private readonly dss: DataSourceService,
    private readonly configService: ConfigService,
  ) {}

  @Query(_returns => String, { nullable: true })
  async currentDatabase(): Promise<string | undefined> {
    const database = await this.dss.getDS().query(`SELECT DATABASE()`);
    return database[0]["DATABASE()"];
  }

  @Query(_returns => Boolean)
  async hasDatabaseEnv(): Promise<boolean> {
    return !!this.configService.get("DATABASE_URL");
  }

  @Mutation(_returns => Boolean)
  async addDatabaseConnection(
    @Args() args: AddDatabaseConnectionArgs,
  ): Promise<boolean> {
    if (args.useEnv) {
      const url = this.configService.get("DATABASE_URL");
      if (!url) throw new Error("DATABASE_URL not found in env");
      await this.dss.addDS(url);
      return true;
    }
    if (!args.url) throw new Error("url not provided");
    await this.dss.addDS(args.url);
    return true;
  }
}
