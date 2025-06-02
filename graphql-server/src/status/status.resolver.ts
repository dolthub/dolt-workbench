import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { ConnectionProvider } from "../connections/connection.provider";
import { RefArgs } from "../utils/commonTypes";
import { Status, fromStatusRows } from "./status.model";

@Resolver(() => Status)
export class StatusResolver {
  constructor(private readonly conn: ConnectionProvider) {}

  @Query(() => [Status])
  async status(@Args() args: RefArgs): Promise<Status[]> {
    const conn = this.conn.connection();
    const res = await conn.getStatus(args);
    return fromStatusRows(res, args.databaseName, args.refName);
  }

  @Mutation(() => Boolean)
  async restoreAllTables(@Args() args: RefArgs): Promise<boolean> {
    const conn = this.conn.connection();
    await conn.restoreAllTables(args);
    return true;
  }
}
