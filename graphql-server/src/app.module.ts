import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { TerminusModule } from "@nestjs/terminus";
import { DataSourceModule } from "./dataSources/dataSource.module";
import { FileStoreModule } from "./fileStore/fileStore.module";
import resolvers from "./resolvers";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: "schema.gql",
      context: ctx => ctx,
      driver: ApolloDriver,
    }),
    DataSourceModule,
    FileStoreModule,
    TerminusModule,
  ],
  providers: resolvers,
})
export class AppModule {}
