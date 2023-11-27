import {
  Args,
  ArgsType,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "@nestjs/graphql";
import { DataSourceService } from "../dataSources/dataSource.service";
import { FileStoreService } from "../fileStore/fileStore.service";
import { DBArgs } from "../utils/commonTypes";
import { DatabaseConnection } from "./database.model";

@ArgsType()
class AddDatabaseConnectionArgs {
  @Field()
  connectionUrl: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  hideDoltFeatures?: boolean;

  @Field({ nullable: true })
  useSSL?: boolean;
}

@ObjectType()
class DoltDatabaseDetails {
  @Field()
  isDolt: boolean;

  @Field()
  hideDoltFeatures: boolean;
}

@ArgsType()
class RemoveDatabaseConnectionArgs {
  @Field()
  name: string;
}

@Resolver(_of => DatabaseConnection)
export class DatabaseResolver {
  constructor(
    private readonly dss: DataSourceService,
    private readonly fileStoreService: FileStoreService,
  ) {}

  @Query(_returns => String, { nullable: true })
  async currentDatabase(): Promise<string | undefined> {
    const qr = this.dss.getQR();
    try {
      const res = await qr.getCurrentDatabase();
      return res;
    } finally {
      await qr.release();
    }
  }

  @Query(_returns => [DatabaseConnection])
  async storedConnections(): Promise<DatabaseConnection[]> {
    return this.fileStoreService.getStore();
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

  @Query(_returns => DoltDatabaseDetails)
  async doltDatabaseDetails(): Promise<DoltDatabaseDetails> {
    const workbenchConfig = this.dss.getWorkbenchConfig();
    const qr = this.dss.getQR();
    try {
      const isDolt = await this.dss.getIsDolt(qr);
      return {
        isDolt,
        hideDoltFeatures: workbenchConfig?.hideDoltFeatures ?? false,
      };
    } finally {
      await qr.release();
    }
  }

  @Mutation(_returns => String, { nullable: true })
  async addDatabaseConnection(
    @Args() args: AddDatabaseConnectionArgs,
  ): Promise<string | undefined> {
    const workbenchConfig = {
      connectionUrl: args.connectionUrl,
      hideDoltFeatures: !!args.hideDoltFeatures,
      useSSL: !!args.useSSL,
    };
    await this.dss.addDS(workbenchConfig);

    this.fileStoreService.addItemToStore({
      ...workbenchConfig,
      name: args.name,
    });

    const db = await this.currentDatabase();
    if (!db) return undefined;
    return db;
  }

  @Mutation(_returns => Boolean)
  async removeDatabaseConnection(
    @Args() args: RemoveDatabaseConnectionArgs,
  ): Promise<boolean> {
    this.fileStoreService.removeItemFromStore(args.name);
    return true;
  }

  @Mutation(_returns => Boolean)
  async createDatabase(@Args() args: DBArgs): Promise<boolean> {
    const qr = this.dss.getQR();
    try {
      await qr.createDatabase(args.databaseName);
      return true;
    } finally {
      await qr.release();
    }
  }

  @Mutation(_returns => Boolean)
  async resetDatabase(): Promise<boolean> {
    await this.dss.resetDS();
    return true;
  }
}
