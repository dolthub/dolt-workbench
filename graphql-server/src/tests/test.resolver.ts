import {
  Args, ArgsType, Field,
  Query,
  Resolver,
} from "@nestjs/graphql";
import { ConnectionProvider } from "../connections/connection.provider";
import { AuthorInfo, RefArgs, TagArgs } from "../utils/commonTypes";
import { Test, TestList, fromDoltRowRes } from "./test.model";

@Resolver(_of => Test)
export class TestResolver {
  constructor(private readonly conn: ConnectionProvider) {}

  @Query(_returns => TestList)
  async tests(@Args() args: RefArgs): Promise<TestList> {
    const conn = this.conn.connection();
    const res = await conn.getTests(args);
    return {
      list: res.map(t => fromDoltRowRes(t)),
    };
  }
}
