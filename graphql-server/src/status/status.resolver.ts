import { Args, Query, Resolver } from "@nestjs/graphql";
import { ConnectionResolver } from "../connections/connection.resolver";
import { RefArgs } from "../utils/commonTypes";
import { Status, fromStatusRows } from "./status.model";
import { statusQuery } from "./status.queries";

@Resolver(_of => Status)
export class StatusResolver {
  constructor(private readonly conn: ConnectionResolver) {}

  @Query(_returns => [Status])
  async status(@Args() args: RefArgs): Promise<Status[]> {
    const conn = this.conn.connection();
    return conn.query(
      async query => {
        const res = await query(statusQuery);
        return fromStatusRows(res, args.databaseName, args.refName);
      },
      args.databaseName,
      args.refName,
    );
  }
}
