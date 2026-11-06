import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { TerminusModule } from "@nestjs/terminus";
import { CloseCursorsInterceptor } from "./connections/closeCursors.interceptor";
import { ConnectionProvider } from "./connections/connection.provider";
import { DataStoreModule } from "./dataStore/dataStore.module";
import { FileStoreModule } from "./fileStore/fileStore.module";
import resolvers from "./resolvers";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile:
        process.env.NEXT_PUBLIC_FOR_ELECTRON === "true"
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
  providers: [
    ConnectionProvider,
    { provide: APP_INTERCEPTOR, useClass: CloseCursorsInterceptor },
    ...resolvers,
  ],
})
export class AppModule {}
