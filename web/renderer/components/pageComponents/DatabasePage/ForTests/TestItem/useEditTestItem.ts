import { useRef, useEffect, useCallback } from "react";
import { useTestContext } from "../context";
import { Test } from "@gen/graphql-types";
import { useSetState } from "@dolthub/react-hooks";

export function useEditTestItem(test: Test) {
  const {
    state,
    setState,
    sortedGroupEntries,
    toggleExpanded,
    handleRunTest,
  } = useTestContext();

  const [testItemState, setTestItemState] = useSetState({
    showDeleteConfirm: false,
    localAssertionValue: test.assertionValue,
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateTest = useCallback(
    (name: string, field: keyof Test, value: string) => {
      setState({
        tests: state.tests.map((test: Test) =>
          test.testName === name ? { ...test, [field]: value } : test,
        ),
        hasUnsavedChanges: true,
      });
    },
    [state.tests, setState],
  );

  const handleDeleteTest = (testName: string) => {
    const newExpandedItems = new Set(state.expandedItems);
    newExpandedItems.delete(testName);
    setState({
      tests: state.tests.filter(test => test.testName !== testName),
      expandedItems: newExpandedItems,
      hasUnsavedChanges: true,
    });
  };

  const handleTestNameEdit = (testName: string, name: string) => {
    setState({
      editingTestNames: {
        ...state.editingTestNames,
        [testName]: name,
      },
    });
  };

  const handleTestNameBlur = (testName: string) => {
    const newName = state.editingTestNames[testName];
    const test = state.tests.find(t => t.testName === testName);
    if (newName.trim() && newName !== test?.testName) {
      updateTest(testName, "testName", newName.trim());
    }
    const newEditingTestNames = { ...state.editingTestNames };
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
  const isExpanded = state.expandedItems.has(test.testName);
  const editingName = state.editingTestNames[test.testName];
  const testResult = state.testResults[test.testName];

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
