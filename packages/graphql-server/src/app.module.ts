import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GraphQLModule } from "@nestjs/graphql";
import { TerminusModule } from "@nestjs/terminus";
import { DataSourceModule } from "./dataSources/dataSource.module";
import resolvers from "./resolvers";

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".development.env" }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: "schema.gql",
      context: ctx => ctx,
      driver: ApolloDriver,
    }),
    DataSourceModule,
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => {
    //     return {
    //       type: "mysql",
    //       url: configService.get("DATABASE_URL"),
    //       ssl: {
    //         rejectUnauthorized: false,
    //       },
    //       autoLoadEntities: true,
    //       synchronize: false,
    //     };
    //   },
    //   inject: [ConfigService],
    // }),
    TerminusModule,
  ],
  providers: resolvers,
})
export class AppModule {}
