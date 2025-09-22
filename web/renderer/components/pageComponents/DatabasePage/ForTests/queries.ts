import { gql } from "@apollo/client";

export const LIST_TESTS = gql`
  query TestList($databaseName: String!, $refName: String!) {
    tests(databaseName: $databaseName, refName: $refName) {
      list {
        _id
        databaseName
        refName
        testName
        testQuery
        testGroup
        assertionType
        assertionComparator
        assertionValue
      }
    }
  }
`;

export const SAVE_TESTS = gql`
  fragment TestFragment on Test {
    testName
    testGroup
    testQuery
    assertionType
    assertionComparator
    assertionValue
  }
  mutation SaveTests(
    $databaseName: String!
    $refName: String!
    $tests: TestListArgs!
  ) {
    saveTests(databaseName: $databaseName, refName: $refName, tests: $tests) {
      list {
        testName
        testGroup
        testQuery
        assertionType
        assertionComparator
        assertionValue
      }
    }
  }
`;

export const RUN_TESTS = gql`
  query RunTests(
    $databaseName: String!
    $refName: String!
    $testIdentifier: TestIdentifierArgs
  ) {
    runTests(
      databaseName: $databaseName
      refName: $refName
      testIdentifier: $testIdentifier
    ) {
      list {
        _id
        databaseName
        refName
        testName
        testGroupName
        query
        status
        message
      }
    }
  }
`;
