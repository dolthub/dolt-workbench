import { Field, ObjectType } from "@nestjs/graphql";
import { RawRow } from "../queryFactory/types";
import { ObjectLiteral } from "typeorm";

@ObjectType()
export class Test {
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

@ObjectType()
export class TestList {
  @Field(_type => [Test])
  list: Test[];
}

@ObjectType()
export class TestResult {
  @Field()
  testName: string;

  @Field({ nullable: true })
  testGroupName: string;

  @Field()
  query: string;

  @Field()
  status: string;

  @Field()
  message: string;
}

@ObjectType()
export class TestResultList {
  @Field(_type => [TestResult])
  list: TestResult[];
}

export function fromDoltTestRowRes(test: RawRow | ObjectLiteral): Test {
  return {
    testName: test.test_name,
    testGroup: test.test_group,
    testQuery: test.test_query,
    assertionType: test.assertion_type,
    assertionComparator: test.assertion_comparator,
    assertionValue: test.assertion_value,
  };
}

export function fromDoltTestResultRowRes(testResult: RawRow): TestResult {
  return {
    testName: testResult.test_name,
    testGroupName: testResult.test_group_name,
    query: testResult.query,
    status: testResult.status,
    message: testResult.message,
  }
}
