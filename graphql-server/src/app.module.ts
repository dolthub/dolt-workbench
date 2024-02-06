import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { TerminusModule } from "@nestjs/terminus";
import { DataStoreModule } from "./dataStore/dataStore.module";
import { FileStoreModule } from "./fileStore/fileStore.module";
import resolvers from "./resolvers";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: "schema.gql",
      context: ctx => ctx,
      driver: ApolloDriver,
    }),
    FileStoreModule,
    TerminusModule,
    ConfigModule.forRoot({ isGlobal: true }),
    DataStoreModule,
  ],
  providers: resolvers,
})
export class AppModule {}
