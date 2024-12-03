import { Args, Query, Resolver } from "@nestjs/graphql";
import { ConnectionProvider } from "src/connections/connection.provider";
import { DBArgsWithOffset } from "src/utils/commonTypes";
import { RawRow } from "src/queryFactory/types";
import { getNextOffset, ROW_LIMIT } from "src/utils";
import { fromDoltRemotesRow, Remote, RemoteList } from "./remote.model";

@Resolver(_of => Remote)
export class RemoteResolver {
  constructor(private readonly conn: ConnectionProvider) {}

  @Query(_returns => RemoteList)
  async remotes(@Args() args: DBArgsWithOffset): Promise<RemoteList> {
    const conn = this.conn.connection();

    const res = await conn.getRemotes(args);
    return getRemoteListRes(res, args);
  }
}

function getRemoteListRes(
  remotes: RawRow[],
  args: DBArgsWithOffset,
): RemoteList {
  return {
    list: remotes
      .slice(0, ROW_LIMIT)
      .map(l => fromDoltRemotesRow(args.databaseName, l)),
    nextOffset: getNextOffset(remotes.length, args.offset ?? 0),
  };
}