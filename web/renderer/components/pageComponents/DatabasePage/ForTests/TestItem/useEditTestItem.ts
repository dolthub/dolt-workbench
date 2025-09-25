import { useRef, useEffect, useCallback } from "react";
import { useTestContext } from "../context";
import { Test } from "@gen/graphql-types";
import { useSetState } from "@dolthub/react-hooks";

export function useEditTestItem(test: Test) {
  const {
    expandedItems,
    editingTestNames,
    testResults,
    sortedGroupEntries,
    tests,
    toggleExpanded,
    handleRunTest,
    setState,
  } = useTestContext();

  const [testItemState, setTestItemState] = useSetState({
    showDeleteConfirm: false,
    localAssertionValue: test.assertionValue,
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateTest = useCallback(
    (name: string, field: keyof Test, value: string) => {
      setState({
        tests: tests.map((test: Test) =>
          test.testName === name ? { ...test, [field]: value } : test,
        ),
        hasUnsavedChanges: true,
      });
    },
    [tests, setState],
  );

  const handleDeleteTest = (testName: string) => {
    const newExpandedItems = new Set(expandedItems);
    newExpandedItems.delete(testName);
    setState({
      tests: tests.filter(test => test.testName !== testName),
      expandedItems: newExpandedItems,
      hasUnsavedChanges: true,
    });
  };

  const handleTestNameEdit = (testName: string, name: string) => {
    setState({
      editingTestNames: {
        ...editingTestNames,
        [testName]: name,
      },
    });
  };

  const handleTestNameBlur = (testName: string) => {
    const newName = editingTestNames[testName];
    const test = tests.find(t => t.testName === testName);
    if (newName.trim() && newName !== test?.testName) {
      updateTest(testName, "testName", newName.trim());
    }
    const newEditingTestNames = { ...editingTestNames };
    delete newEditingTestNames[testName];
    setState({ editingTestNames: newEditingTestNames });
  };

  const debouncedOnUpdateTest = (field: keyof Test, value: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      updateTest(test.testName, field, value);
    }, 500); // 500ms debounce
  };

  useEffect(
    () => () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    setTestItemState({
      localAssertionValue: test.assertionValue,
    });
  }, [setTestItemState, test.assertionValue]);

  const groupOptions = sortedGroupEntries
    .map(entry => entry[0])
    .filter(group => group !== "");
  const isExpanded = expandedItems.has(test.testName);
  const editingName = editingTestNames[test.testName];
  const testResult = testResults[test.testName];

  return {
    testItemState,
    setTestItemState,
    updateTest,
    handleDeleteTest,
    handleTestNameEdit,
    handleTestNameBlur,
    debouncedOnUpdateTest,
    handleRunTest,
    groupOptions,
    isExpanded,
    editingName,
    testResult,
    toggleExpanded,
  };
}
