import { Test } from "@gen/graphql-types";

export const defaultState = {
  expandedItems: new Set<string>(),
  expandedGroups: new Set<string>(),
  editingTestNames: {} as Record<string, string>,
  hasUnsavedChanges: false,
  tests: [] as Test[],
  emptyGroups: new Set<string>(),
  testResults: {} as Record<
    string,
    { status: "passed" | "failed"; error?: string } | undefined
  >,
  hasHandledHash: false,
};

export type TestState = typeof defaultState;

export type TestContextType = {
  expandedItems: Set<string>;
  expandedGroups: Set<string>;
  emptyGroups: Set<string>;
  editingTestNames: Record<string, string>;
  tests: Test[];
  groupedTests: Record<string, Test[]>;
  sortedGroupEntries: Array<[string, Test[]]>;
  testResults: Record<
    string,
    { status: "passed" | "failed"; error?: string } | undefined
  >;
  testsLoading: boolean;
  testsError?: string;
  toggleExpanded: (testName: string) => void;
  toggleGroupExpanded: (groupName: string) => void;
  handleRunTest: (testName: string) => Promise<void>;
  handleRunGroup: (groupName: string) => Promise<void>;
  handleRunAll: () => Promise<void>;
  handleCreateTest: (groupName?: string) => void;
  handleHashNavigation: () => void;
  setState: (state: Partial<TestState>) => void;
};
