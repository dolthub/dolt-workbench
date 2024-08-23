import { Args, Query, Resolver } from "@nestjs/graphql";
import { ConnectionProvider } from "../connections/connection.provider";
import { RefArgs } from "../utils/commonTypes";
import { Status, fromStatusRows } from "./status.model";

@Resolver(_of => Status)
export class StatusResolver {
  constructor(private readonly conn: ConnectionProvider) {}

  @Query(_returns => [Status])
  async status(@Args() args: RefArgs): Promise<Status[]> {
    const conn = this.conn.connection();
    const res = await conn.getStatus(args);
    return fromStatusRows(res, args.databaseName, args.refName);
  }
}
