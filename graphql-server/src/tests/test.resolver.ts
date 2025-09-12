import {
  Args, ArgsType, Field, InputType, Mutation,
  Query,
  Resolver,
} from "@nestjs/graphql";
import { ConnectionProvider } from "../connections/connection.provider";
import {  RefArgs  } from "../utils/commonTypes";
import { Test, TestList, fromDoltTestRowRes, TestResultList, fromDoltTestResultRowRes } from "./test.model";


@InputType()
class TestArgs {
  @Field()
  testName: string;

  @Field()
  testGroup: string;

  @Field()
  testQuery: string;

  @Field()
  assertionType: string;

  @Field()
  assertionComparator: string;

  @Field()
  assertionValue: string;
}

@InputType()
class TestListArgs {
  @Field(_type => [TestArgs])
  list: TestArgs[];
}

@ArgsType()
class SaveTestsArgs extends RefArgs {
  @Field()
  tests: TestListArgs;
}

@InputType()
class TestIdentifierArgs {
  @Field(_type => [String])
  values: string[];
}

@ArgsType()
class RunTestsArgs extends RefArgs {
  @Field({ nullable: true })
  identifiers?: TestIdentifierArgs;
}

@Resolver(_of => Test)
export class TestResolver {
  constructor(private readonly conn: ConnectionProvider) {}

  @Query(_returns => TestList)
  async tests(@Args() args: RefArgs): Promise<TestList> {
    const conn = this.conn.connection();
    const res = await conn.getTests(args);
    return {
      list: res.map(t => fromDoltTestRowRes(t)),
    };
  }

  @Query(_returns => TestResultList)
  async runTests(@Args() args: RunTestsArgs) {
    const conn = this.conn.connection();
    const res = await conn.runTests(args);
    return {
      list: res.map(t => fromDoltTestResultRowRes(t)),
    };
  }

  @Mutation(_returns => TestList)
  async saveTests(@Args() args: SaveTestsArgs): Promise<TestList> {
    const conn = this.conn.connection();
    const res = await conn.saveTests(args);
    console.dir(res, { depth: null });
    return {
      list: res.generatedMaps.map(t => fromDoltTestRowRes(t)),
    };
  }
}
