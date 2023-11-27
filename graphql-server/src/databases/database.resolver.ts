import { ConfigService } from "@nestjs/config";
import {
  Args,
  ArgsType,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "@nestjs/graphql";
import * as fs from "fs";
import { resolve } from "path";
import { DataSourceService } from "../dataSources/dataSource.service";
import { DBArgs } from "../utils/commonTypes";

@ArgsType()
class AddDatabaseConnectionArgs {
  @Field({ nullable: true })
  connectionUrl?: string;

  @Field({ nullable: true })
  useEnv?: boolean;

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

@ObjectType()
class StoredState {
  @Field()
  connectionUrl: string;

  @Field({ nullable: true })
  useSSL?: boolean;

  @Field({ nullable: true })
  hideDoltFeatures?: boolean;
}

@ObjectType()
class DatabaseState {
  @Field()
  hasEnv: boolean;

  @Field(_type => StoredState, { nullable: true })
  storedState?: StoredState;
}

@Resolver()
export class DatabaseResolver {
  constructor(
    private readonly dss: DataSourceService,
    private readonly configService: ConfigService,
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

  @Query(_returns => DatabaseState)
  async databaseState(): Promise<DatabaseState> {
    const hasEnv = !!this.configService.get("DATABASE_URL");
    try {
      const file = fs.readFileSync(
        resolve(__dirname, "../../store/store.json"),
        {
          encoding: "utf8",
        },
      );
      if (!file) {
        return { hasEnv };
      }
      const parsed = JSON.parse(file);
      return {
        hasEnv,
        storedState: parsed,
      };
    } catch (err) {
      console.error("Error reading store.json:", err);
      return { hasEnv };
    }
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
    if (args.useEnv) {
      const url = this.configService.get("DATABASE_URL");
      if (!url) throw new Error("DATABASE_URL not found in env");
      const hideDoltFeatures = this.configService.get("HIDE_DOLT_FEATURES");
      const useSSL = this.configService.get("USE_SSL");
      const workbenchConfig = {
        connectionUrl: url,
        hideDoltFeatures: !!hideDoltFeatures && hideDoltFeatures === "true",
        useSSL: useSSL !== undefined ? useSSL === "true" : true,
      };
      await this.dss.addDS(workbenchConfig);
    } else if (args.connectionUrl) {
      const workbenchConfig = {
        connectionUrl: args.connectionUrl,
        hideDoltFeatures: !!args.hideDoltFeatures,
        useSSL: !!args.useSSL,
      };
      await this.dss.addDS(workbenchConfig);

      if (!fs.existsSync(resolve(__dirname, "../../store"))) {
        fs.mkdirSync(resolve(__dirname, "../../store"));
      }

      const stringified = JSON.stringify(workbenchConfig);
      fs.writeFileSync(
        resolve(__dirname, "../../store/store.json"),
        stringified,
      );
    } else {
      throw new Error("database url not provided");
    }

    const db = await this.currentDatabase();
    if (!db) return undefined;
    return db;
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
