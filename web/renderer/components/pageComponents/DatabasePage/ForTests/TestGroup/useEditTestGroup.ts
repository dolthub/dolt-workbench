import { KeyboardEvent } from "react";
import { useTestContext } from "../context";
import { getGroupResult } from "@pageComponents/DatabasePage/ForTests/utils";
import { useSetState } from "@dolthub/react-hooks";

export function useEditTestGroup(group: string) {
  const {
    state,
    groupedTests,
    setState,
    handleRunGroup,
    handleCreateTest,
    toggleGroupExpanded,
  } = useTestContext();

  const groupName = group || "No Group";
  const [testGroupState, setTestGroupState] = useSetState({
    localGroupName: groupName,
    isEditing: false,
    showDeleteConfirm: false,
  });

  const handleDeleteGroup = (groupName: string) => {
    const newExpandedGroups = new Set(state.expandedGroups);
    newExpandedGroups.delete(groupName);
    const newEmptyGroups = new Set(state.emptyGroups);
    newEmptyGroups.delete(groupName);
    setState({
      tests: state.tests.filter(test => test.testGroup !== groupName),
      expandedGroups: newExpandedGroups,
      emptyGroups: newEmptyGroups,
      hasUnsavedChanges: true,
    });
    setTestGroupState({
      showDeleteConfirm: false,
    });
  };

  const handleRenameGroup = (oldName: string, newName: string) => {
    if (newName.trim() && oldName !== newName.trim()) {
      const newExpandedGroups = new Set(state.expandedGroups);
      if (newExpandedGroups.has(oldName)) {
        newExpandedGroups.delete(oldName);
        newExpandedGroups.add(newName.trim());
      }
      setState({
        tests: state.tests.map(test =>
          test.testGroup === oldName
            ? { ...test, testGroup: newName.trim() }
            : test,
        ),
        expandedGroups: newExpandedGroups,
        hasUnsavedChanges: true,
      });
    }
  };

  const handleInputBlur = () => {
    if (
      testGroupState.localGroupName.trim() &&
      testGroupState.localGroupName !== groupName
    ) {
      handleRenameGroup(groupName, testGroupState.localGroupName.trim());
    } else {
      setTestGroupState({
        localGroupName: groupName,
      });
    }
    setTestGroupState({
      isEditing: false,
    });
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
    } else if (e.key === "Escape") {
      setTestGroupState({
        localGroupName: groupName,
      });
      setTestGroupState({
        isEditing: false,
      });
    }
  };

  const isExpanded = state.expandedGroups.has(group);
  const testCount = groupedTests[group].length || 0;
  const groupResult = getGroupResult(group, groupedTests, state.testResults);

  return {
    groupName,
    isExpanded,
    testCount,
    groupResult,
    testGroupState,
    setTestGroupState,
    toggleGroupExpanded,
    handleRunGroup,
    handleDeleteGroup,
    handleCreateTest,
    handleInputBlur,
    handleInputKeyDown,
  };
}
