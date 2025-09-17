import { gql } from "@apollo/client";

export const LIST_TESTS = gql`
  query TestList($databaseName: String!, $refName: String!) {
    tests(databaseName: $databaseName, refName: $refName) {
      list {
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
  mutation SaveTests($databaseName: String!, $refName: String!, $tests: TestListArgs!) {
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
`

export const RUN_TESTS = gql`
  query RunTests($databaseName: String!, $refName: String!, $identifiers: TestIdentifierArgs) {
    runTests(databaseName: $databaseName, refName: $refName, identifiers: $identifiers) {
      list {
        testName
        testGroupName
        query
        status
        message
      }
    }
  }
`

