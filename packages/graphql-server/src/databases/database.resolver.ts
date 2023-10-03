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
import { DBArgs } from "../utils/commonTypes";

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
    return this.dss.query(async query => {
      const dbs = await query("SHOW DATABASES");
      return dbs
        .map(db => db.Database)
        .filter(
          db =>
            db !== "information_schema" &&
            db !== "mysql" &&
            db !== "dolt_cluster" &&
            !db.includes("/"),
        );
    });
  }

  @Query(_returns => Boolean)
  async isDolt(): Promise<boolean> {
    const ds = this.dss.getDS();
    const res = await ds.query("SELECT dolt_version()");
    return !!res;
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

  @Mutation(_returns => Boolean)
  async createDatabase(@Args() args: DBArgs): Promise<boolean> {
    await this.dss.getQR().createDatabase(args.databaseName);
    return true;
  }
}
