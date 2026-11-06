import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { GqlContextType, GqlExecutionContext } from "@nestjs/graphql";
import { GraphQLResolveInfo } from "graphql";
import { Observable } from "rxjs";
import { ConnectionProvider } from "./connection.provider";

// A statement held open for paging can hold table locks that a mutation
// (DDL, merges, imports) would otherwise wait on.
@Injectable()
export class CloseCursorsInterceptor implements NestInterceptor {
  constructor(private readonly conn: ConnectionProvider) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (
      context.getType<GqlContextType>() === "graphql" &&
      GqlExecutionContext.create(context).getInfo<GraphQLResolveInfo>()
        .operation.operation === "mutation"
    ) {
      this.conn.closeCursors();
    }
    return next.handle();
  }
}
