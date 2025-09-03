import { Field, ObjectType } from "@nestjs/graphql";
import { RawRow } from "../queryFactory/types";

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

export function fromDoltRowRes(test: RawRow): Test {
  return {
    testName: test.test_name,
    testGroup: test.test_group,
    testQuery: test.test_query,
    assertionType: test.assertion_type,
    assertionComparator: test.assertion_comparator,
    assertionValue: test.assertion_value,
  };
}
