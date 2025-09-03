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
