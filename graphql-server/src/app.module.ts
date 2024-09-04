import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { TerminusModule } from "@nestjs/terminus";
import { ConnectionProvider } from "./connections/connection.provider";
import { DataStoreModule } from "./dataStore/dataStore.module";
import { FileStoreModule } from "./fileStore/fileStore.module";
import resolvers from "./resolvers";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile:
        process.env.FOR_ELECTRON === "true"
          ? process.env.SCHEMA_PATH
          : "schema.gql",
      context: ctx => ctx,
      driver: ApolloDriver,
    }),
    FileStoreModule,
    TerminusModule,
    ConfigModule.forRoot({ isGlobal: true }),
    DataStoreModule,
  ],
  providers: [ConnectionProvider, ...resolvers],
})
export class AppModule {}
