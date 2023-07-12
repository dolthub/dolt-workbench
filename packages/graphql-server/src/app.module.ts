import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { TerminusModule } from "@nestjs/terminus";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: "schema.gql",
      context: ctx => ctx,
      driver: ApolloDriver,
    }),
    // ConfigModule,
    // DoltDataSourceModule,
    TerminusModule,
  ],
  // providers: [
  //   APIProvider,
  //   {
  //     provide: APP_INTERCEPTOR,
  //     useClass: AuthInterceptor,
  //   },
  //   ...resolvers,
  // ],
  // controllers: [HealthController],
})
export class AppModule {}
