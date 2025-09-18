export type StatusColors = {
  red: boolean;
  green: boolean;
  orange: boolean;
};

export function getTestStatusColors(testResult: any): StatusColors {
  if (!testResult) {
    return { red: false, green: false, orange: true };
  }

  if (testResult.status === "failed") {
    return { red: true, green: false, orange: false };
  }

  return { red: false, green: true, orange: false };
}

export function getGroupStatusColors(
  groupTests: any[],
  testResults: Record<string, any>,
): StatusColors {
  const groupTestResults = groupTests
    .map(test => testResults[test.testName])
    .filter(Boolean);

  if (groupTestResults.length === 0) {
    return { red: false, green: false, orange: true };
  }

  const hasFailures = groupTestResults.some(
    result => result && result.status === "failed",
  );
  if (hasFailures) {
    return { red: true, green: false, orange: false };
  }

  return { red: false, green: true, orange: false };
}

export function getStatusClassName(
  statusColors: StatusColors,
  cssClasses: {
    green: string;
    red: string;
    orange: string;
  },
): string {
  if (statusColors.green) return cssClasses.green;
  if (statusColors.red) return cssClasses.red;
  if (statusColors.orange) return cssClasses.orange;
  return "";
}