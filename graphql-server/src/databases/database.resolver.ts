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
class GetDoltDatabaseDetailsArgs {
  @Field()
  connectionName: string;
}

@ArgsType()
class AddDatabaseConnectionArgs {
  @Field()
  connectionUrl: string;

  @Field()
  connectionName: string;

  @Field({ nullable: true })
  hideDoltFeatures?: boolean;

  @Field({ nullable: true })
  useSSL?: boolean;

  @Field(_type => DatabaseType, { nullable: true })
  type?: DatabaseType;
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

@ArgsType()
class RemoveDatabaseConnectionArgs {
  @Field()
  connectionName: string;
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
  async currentDatabase(
    @Args() { connectionName }: GetDoltDatabaseDetailsArgs,
  ): Promise<string | undefined> {
    const conn = this.conn.connection(connectionName);
    return conn.currentDatabase();
  }

  @Query(_returns => DatabaseConnection, { nullable: true })
  async currentConnection(): Promise<DatabaseConnection | undefined> {
    const config = this.conn.getWorkbenchConfig();
    if (!config) return undefined;
    const isDolt = this.conn.getIsDolt();
    const storedConnections = await this.storedConnections();
    const connectionName = storedConnections.find(
      x => x.connectionUrl === config.connectionUrl,
    )?.connectionName;
    if (!connectionName) return undefined;
    return {
      connectionUrl: config.connectionUrl,
      connectionName,
      hideDoltFeatures: config.hideDoltFeatures,
      useSSL: config.useSSL,
      type: config.type,
      isDolt,
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
  async databases(
    @Args() { connectionName }: GetDoltDatabaseDetailsArgs,
  ): Promise<string[]> {
    const conn = this.conn.connection(connectionName);
    return conn.databases();
  }

  @Query(_returns => [String])
  async databasesByConnection(
    @Args() args: AddDatabaseConnectionArgs,
  ): Promise<string[]> {
    if (this.conn.getWorkbenchConfig()?.connectionUrl === args.connectionUrl) {
      return this.databases(args);
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
    const conn = this.conn.connection(args.connectionName);
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
  async doltDatabaseDetails(
    @Args() { connectionName }: GetDoltDatabaseDetailsArgs,
  ): Promise<DoltDatabaseDetails> {
    const workbenchConfig = this.conn.getWorkbenchConfig();
    const conn = this.conn.connection(connectionName);
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
    const storeArgs = { ...workbenchConfig, isDolt };

    if (this.dataStoreService.hasDataStoreConfig()) {
      await this.dataStoreService.addStoredConnection(storeArgs);
    } else {
      this.fileStoreService.addItemToStore(storeArgs);
    }

    const db = await this.currentDatabase(args);
    return { currentDatabase: db };
  }

  @Mutation(_returns => Boolean)
  async removeDatabaseConnection(
    @Args() args: RemoveDatabaseConnectionArgs,
  ): Promise<boolean> {
    if (this.dataStoreService.hasDataStoreConfig()) {
      await this.dataStoreService.removeStoredConnection(args.connectionName);
    } else {
      this.fileStoreService.removeItemFromStore(args.connectionName);
    }
    return true;
  }

  @Mutation(_returns => Boolean)
  async createDatabase(@Args() args: DBArgs): Promise<boolean> {
    const conn = this.conn.connection(args.connectionName);
    await conn.createDatabase(args);
    return true;
  }

  @Mutation(_returns => Boolean)
  async createSchema(@Args() args: RefSchemaArgs): Promise<boolean> {
    const conn = this.conn.connection(args.connectionName);
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
    connectionName: args.connectionName,
    connectionUrl: args.connectionUrl,
    hideDoltFeatures: !!args.hideDoltFeatures,
    useSSL: !!args.useSSL,
    type,
  };
}
