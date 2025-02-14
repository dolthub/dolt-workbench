import {
  Args,
  ArgsType,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "@nestjs/graphql";
import {
  ConnectionProvider,
  getDataSource,
  newQueryFactory,
  WorkbenchConfig,
} from "../connections/connection.provider";
import { DataStoreService } from "../dataStore/dataStore.service";
import { FileStoreService } from "../fileStore/fileStore.service";
import { DBArgs, RefArgs, RefSchemaArgs } from "../utils/commonTypes";
import { DatabaseType } from "./database.enum";
import { DatabaseConnection } from "./database.model";

@ArgsType()
class AddDatabaseConnectionArgs {
  @Field()
  connectionUrl: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  port?: string;

  @Field({ nullable: true })
  hideDoltFeatures?: boolean;

  @Field({ nullable: true })
  useSSL?: boolean;

  @Field(_type => DatabaseType, { nullable: true })
  type?: DatabaseType;

  @Field({ nullable: true })
  isLocalDolt?: boolean;
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
}

@ObjectType()
class DoltServerStatus {
  @Field({ nullable: true })
  active?: boolean;
}

@ArgsType()
class RemoveDatabaseConnectionArgs {
  @Field()
  name: string;
}

@ArgsType()
class ResetConnectionArgs {
  @Field({ nullable: true })
  newDatabase?: string;
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

  @Query(_returns => DatabaseConnection, { nullable: true })
  async currentConnection(): Promise<DatabaseConnection | undefined> {
    const config = this.conn.getWorkbenchConfig();
    if (!config) return undefined;
    const isDolt = this.conn.getIsDolt();
    const storedConnections = await this.storedConnections();
    const connectionName = storedConnections.find(x =>
      // Handles connection URLs in config that contain database name
      config.connectionUrl.startsWith(x.connectionUrl),
    )?.name;
    if (!connectionName) return undefined;
    return {
      connectionUrl: config.connectionUrl,
      name: connectionName,
      port: config.port,
      hideDoltFeatures: config.hideDoltFeatures,
      useSSL: config.useSSL,
      type: config.type,
      isDolt,
      isLocalDolt: config.isLocalDolt,
    };
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
    return dbs;
  }

  // Checking if the internal dolt server is running
  @Query(_returns => DoltServerStatus)
  async doltServerStatus(
    @Args() args: AddDatabaseConnectionArgs,
  ): Promise<DoltServerStatus> {
    // if current connection is the same as the internal dolt server, return true
    if (this.conn.getWorkbenchConfig()?.connectionUrl === args.connectionUrl) {
      return { active: true };
    }
    const workbenchConfig = getWorkbenchConfigFromArgs(args);
    try {
      const ds = getDataSource(workbenchConfig);
      await ds.initialize();
      await ds.query("SELECT 1");
      return { active: true };
    } catch (error) {
      console.error("Error checking connection:", error.message);
      return { active: false };
    }
  }

  @Query(_returns => [String])
  async databasesByConnection(
    @Args() args: AddDatabaseConnectionArgs,
  ): Promise<string[]> {
    if (this.conn.getWorkbenchConfig()?.connectionUrl === args.connectionUrl) {
      return this.databases();
    }
    const workbenchConfig = getWorkbenchConfigFromArgs(args);
    const ds = getDataSource(workbenchConfig);
    await ds.initialize();

    try {
      const { qf } = await newQueryFactory(workbenchConfig.type, ds);
      const dbs = await qf.databases();
      return dbs;
    } finally {
      await ds.destroy();
    }
  }

  @Query(_returns => [String])
  async schemas(@Args() args: RefArgs): Promise<string[]> {
    const conn = this.conn.connection();
    if (!conn.schemas) return [];
    const schemas = await conn.schemas(args);
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
    const workbenchConfig = getWorkbenchConfigFromArgs(args);

    const { isDolt } = await this.conn.addConnection(workbenchConfig);
    const storeArgs = { ...workbenchConfig, name: args.name, isDolt };
    if (this.dataStoreService.hasDataStoreConfig()) {
      await this.dataStoreService.addStoredConnection(storeArgs);
    } else {
      this.fileStoreService.addItemToStore(storeArgs);
    }

    const db = await this.currentDatabase();
    return { currentDatabase: db };
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
  async createSchema(@Args() args: RefSchemaArgs): Promise<boolean> {
    const conn = this.conn.connection();
    if (!conn.createSchema) return false;
    await conn.createSchema(args);
    return true;
  }

  @Mutation(_returns => Boolean)
  async resetDatabase(@Args() args: ResetConnectionArgs): Promise<boolean> {
    await this.conn.resetDS(args.newDatabase);
    return true;
  }
}

function getWorkbenchConfigFromArgs(
  args: AddDatabaseConnectionArgs,
): WorkbenchConfig {
  const type = args.type ?? DatabaseType.Mysql;
  return {
    name: args.name,
    connectionUrl: args.connectionUrl,
    port: args.port,
    hideDoltFeatures: !!args.hideDoltFeatures,
    useSSL: !!args.useSSL,
    type,
    isLocalDolt: args.isLocalDolt,
  };
}
