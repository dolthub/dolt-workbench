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
    return this.dss.getQR().getCurrentDatabase();
  }

  @Query(_returns => Boolean)
  async hasDatabaseEnv(): Promise<boolean> {
    return !!this.configService.get("DATABASE_URL");
  }

  @Query(_returns => [String])
  async databases(): Promise<string[]> {
    return this.dss.getQR().getDatabases();
  }

  @Mutation(_returns => String)
  async addDatabaseConnection(
    @Args() args: AddDatabaseConnectionArgs,
  ): Promise<string> {
    if (args.useEnv) {
      const url = this.configService.get("DATABASE_URL");
      if (!url) throw new Error("DATABASE_URL not found in env");
      await this.dss.addDS(url);
    } else if (args.url) {
      await this.dss.addDS(args.url);
    } else {
      throw new Error("database url not provided");
    }
    const db = await this.dss.getQR().getCurrentDatabase();
    if (!db) throw new Error("database not found");
    return db;
  }
}
