import { Field, ID, ObjectType } from "@nestjs/graphql";
import { RawRow } from "../queryFactory/types";
import { ObjectLiteral } from "typeorm";

@ObjectType()
export class Test {
  @Field(_type => ID)
  _id: string;

  @Field()
  databaseName: string;

  @Field()
  refName: string;

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
  @Field(_type => ID)
  _id: string;

  @Field()
  databaseName: string;

  @Field()
  refName: string;

  @Field()
  testName: string;

  @Field({ nullable: true })
  testGroupName?: string;

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

export function fromDoltTestRowRes(databaseName: string, refName: string, test: RawRow | ObjectLiteral): Test {
  return {
    _id: `databases/${databaseName}/refs/${refName}/tests/${test.test_name}`,
    databaseName: databaseName,
    refName: refName,
    testName: test.test_name,
    testGroup: test.test_group,
    testQuery: test.test_query,
    assertionType: test.assertion_type,
    assertionComparator: test.assertion_comparator,
    assertionValue: test.assertion_value,
  };
}

export function fromDoltTestResultRowRes(databaseName: string, refName: string, testResult: RawRow): TestResult {
  return {
    _id: `databases/${databaseName}/refs/${refName}/testResults/${testResult.test_name}`,
    databaseName: databaseName,
    refName: refName,
    testName: testResult.test_name,
    testGroupName: testResult.test_group_name,
    query: testResult.query,
    status: testResult.status,
    message: testResult.message,
  };
}
