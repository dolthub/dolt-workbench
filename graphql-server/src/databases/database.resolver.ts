import {
  Args,
  ArgsType,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "@nestjs/graphql";
import { ConnectionResolver } from "../connections/connection.resolver";
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
    private readonly conn: ConnectionResolver,
    private readonly fileStoreService: FileStoreService,
  ) {}

  @Query(_returns => String, { nullable: true })
  async currentDatabase(): Promise<string | undefined> {
    const conn = this.conn.connection();
    return conn.currentDatabase();
  }

  @Query(_returns => [DatabaseConnection])
  async storedConnections(): Promise<DatabaseConnection[]> {
    return this.fileStoreService.getStore();
  }

  @Query(_returns => [String])
  async databases(): Promise<string[]> {
    const conn = this.conn.connection();
    const dbs = await conn.databases();
    return dbs
      .map(db => db.Database)
      .filter(
        db =>
          db !== "information_schema" &&
          db !== "mysql" &&
          db !== "dolt_cluster" &&
          !db.includes("/"),
      );
  }

  @Query(_returns => DoltDatabaseDetails)
  async doltDatabaseDetails(): Promise<DoltDatabaseDetails> {
    const workbenchConfig = this.conn.getWorkbenchConfig();
    const conn = this.conn.connection();
    const isDolt = await conn.getIsDolt();
    return {
      isDolt,
      hideDoltFeatures: workbenchConfig?.hideDoltFeatures ?? false,
    };
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
    await this.conn.addConnection(workbenchConfig);

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
    const conn = this.conn.connection();
    await conn.createDatabase(args);
    return true;
  }

  @Mutation(_returns => Boolean)
  async resetDatabase(): Promise<boolean> {
    await this.conn.resetDS();
    return true;
  }
}
