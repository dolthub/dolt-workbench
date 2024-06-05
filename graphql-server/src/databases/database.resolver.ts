import {
  Args,
  ArgsType,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "@nestjs/graphql";
import { ConnectionProvider } from "../connections/connection.provider";
import { DataStoreService } from "../dataStore/dataStore.service";
import { FileStoreService } from "../fileStore/fileStore.service";
import { DBArgs, SchemaArgs } from "../utils/commonTypes";
import { DatabaseType } from "./database.enum";
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

  @Field(_type => DatabaseType, { nullable: true })
  type?: DatabaseType;

  @Field({ nullable: true })
  schema?: string;
}

@ObjectType()
class DoltDatabaseDetails {
  @Field()
  isDolt: boolean;

  @Field()
  hideDoltFeatures: boolean;

  @Field(_type => DatabaseType)
  type: DatabaseType;
}

@ObjectType()
class CurrentDatabaseState {
  @Field({ nullable: true })
  currentDatabase?: string;

  // Postgres only
  @Field({ nullable: true })
  currentSchema?: string;
}

@ArgsType()
class RemoveDatabaseConnectionArgs {
  @Field()
  name: string;
}

@Resolver(_of => DatabaseConnection)
export class DatabaseResolver {
  constructor(
    private readonly conn: ConnectionProvider,
    private readonly fileStoreService: FileStoreService,
    private readonly dataStoreService: DataStoreService,
  ) {}

  @Query(_returns => String, { nullable: true })
  async currentDatabase(): Promise<string | undefined> {
    const conn = this.conn.connection();
    return conn.currentDatabase();
  }

  @Query(_returns => [DatabaseConnection])
  async storedConnections(): Promise<DatabaseConnection[]> {
    if (this.dataStoreService.hasDataStoreConfig()) {
      return this.dataStoreService.getStoredConnections();
    }
    return this.fileStoreService.getStore();
  }

  @Query(_returns => [String])
  async databases(): Promise<string[]> {
    const conn = this.conn.connection();
    const dbs = await conn.databases();
    return dbs.filter(
      db =>
        db !== "information_schema" &&
        db !== "mysql" &&
        db !== "dolt_cluster" &&
        !db.includes("/"),
    );
  }

  @Query(_returns => [String])
  async schemas(): Promise<string[]> {
    const conn = this.conn.connection();
    if (!conn.schemas) return [];
    const db = await this.currentDatabase();
    if (!db) return [];
    const schemas = await conn.schemas({ databaseName: db });
    return schemas.filter(
      sch =>
        sch !== "information_schema" &&
        sch !== "pg_catalog" &&
        sch !== "pg_toast",
    );
  }

  @Query(_returns => DoltDatabaseDetails)
  async doltDatabaseDetails(): Promise<DoltDatabaseDetails> {
    const workbenchConfig = this.conn.getWorkbenchConfig();
    const conn = this.conn.connection();
    return {
      isDolt: conn.isDolt,
      hideDoltFeatures: workbenchConfig?.hideDoltFeatures ?? false,
      type: workbenchConfig?.type ?? DatabaseType.Mysql,
    };
  }

  @Mutation(_returns => CurrentDatabaseState)
  async addDatabaseConnection(
    @Args() args: AddDatabaseConnectionArgs,
  ): Promise<CurrentDatabaseState> {
    const type = args.type ?? DatabaseType.Mysql;

    const workbenchConfig = {
      connectionUrl: args.connectionUrl,
      hideDoltFeatures: !!args.hideDoltFeatures,
      useSSL: !!args.useSSL,
      type,
      schema: args.schema,
    };

    const { isDolt } = await this.conn.addConnection(workbenchConfig);
    const storeArgs = { ...workbenchConfig, name: args.name, isDolt };

    if (this.dataStoreService.hasDataStoreConfig()) {
      await this.dataStoreService.addStoredConnection(storeArgs);
    } else {
      this.fileStoreService.addItemToStore(storeArgs);
    }

    const db = await this.currentDatabase();
    if (type === DatabaseType.Mysql) {
      return { currentDatabase: db };
    }
    if (!db) {
      throw new Error("Must provide database for Postgres connection");
    }
    return { currentDatabase: db, currentSchema: args.schema };
  }

  @Mutation(_returns => Boolean)
  async removeDatabaseConnection(
    @Args() args: RemoveDatabaseConnectionArgs,
  ): Promise<boolean> {
    if (this.dataStoreService.hasDataStoreConfig()) {
      await this.dataStoreService.removeStoredConnection(args.name);
    } else {
      this.fileStoreService.removeItemFromStore(args.name);
    }
    return true;
  }

  @Mutation(_returns => Boolean)
  async createDatabase(@Args() args: DBArgs): Promise<boolean> {
    const conn = this.conn.connection();
    await conn.createDatabase(args);
    return true;
  }

  @Mutation(_returns => Boolean)
  async createSchema(@Args() args: SchemaArgs): Promise<boolean> {
    const conn = this.conn.connection();
    if (!conn.createSchema) return false;
    await conn.createSchema(args);
    return true;
  }

  @Mutation(_returns => Boolean)
  async resetDatabase(): Promise<boolean> {
    await this.conn.resetDS();
    return true;
  }
}
