import { Test, TestResult } from "@gen/graphql-types";

export function getResults(
  testResults: TestResult[],
): Record<string, { status: "passed" | "failed"; error?: string }> {
  const results: Record<
    string,
    { status: "passed" | "failed"; error?: string }
  > = {};
  for (const testResult of testResults) {
    if (testResult.status === "PASS") {
      results[testResult.testName] = {
        status: "passed",
      };
    } else {
      results[testResult.testName] = {
        status: "failed",
        error: testResult.message,
      };
    }
  }
  return results;
}

export function groupTests(
  tests: Test[],
  emptyGroups: Set<string>,
): Record<string, Test[]> {
  const groups: Record<string, Test[]> = {};
  tests.forEach(test => {
    const groupName = test.testGroup || "";
    groups[groupName] ??= [];
    groups[groupName].push(test);
  });

  emptyGroups.forEach(groupName => {
    groups[groupName] ??= [];
  });

  return groups;
}

export function sortGroupEntries(
  groupedTests: Record<string, Test[]>,
): Array<[string, Test[]]> {
  const entries = Object.entries(groupedTests);
  const groupOrder = entries.map(entry => entry[0]);

  entries.sort(([a], [b]) => {
    if (a === "" && b === "") return 0;
    if (a === "") return 1;
    if (b === "") return -1;

    const indexA = groupOrder.indexOf(a);
    const indexB = groupOrder.indexOf(b);

    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;

    return a.localeCompare(b);
  });

  return entries;
}

export function getGroupResult(
  groupName: string,
  groupedTests: Record<string, Test[]>,
  testResults: Record<
    string,
    { status: "passed" | "failed"; error?: string } | undefined
  >,
): "passed" | "failed" | undefined {
  const groupTests = groupedTests[groupName];
  if (groupTests.length === 0) return undefined;

  const results = groupTests.map(test => testResults[test.testName]);

  if (results.some(result => !result)) return undefined;

  const allPassed = results.every(result => result?.status === "passed");
  return allPassed ? "passed" : "failed";
}
