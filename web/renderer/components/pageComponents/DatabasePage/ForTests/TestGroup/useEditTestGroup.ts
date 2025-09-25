import { useState, KeyboardEvent, ChangeEvent, MouseEvent } from "react";
import { useTestContext } from "../context";
import { getGroupResult } from "@pageComponents/DatabasePage/ForTests/utils";

export function useEditTestGroup(group: string) {
  const {
    tests,
    expandedGroups,
    emptyGroups,
    groupedTests,
    testResults,
    setState,
    handleRunGroup,
    handleCreateTest,
    toggleGroupExpanded,
  } = useTestContext();

  const groupName = group || "No Group";
  const [localGroupName, setLocalGroupName] = useState(groupName);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleRunGroupClick = async (e: MouseEvent) => {
    e.stopPropagation();
    await handleRunGroup(group);
  };

  const handleDeleteGroup = (groupName: string) => {
    const newExpandedGroups = new Set(expandedGroups);
    newExpandedGroups.delete(groupName);
    const newEmptyGroups = new Set(emptyGroups);
    newEmptyGroups.delete(groupName);
    setState({
      tests: tests.filter(test => test.testGroup !== groupName),
      expandedGroups: newExpandedGroups,
      emptyGroups: newEmptyGroups,
      hasUnsavedChanges: true,
    });
    setShowDeleteConfirm(false);
  };

  const handleRenameGroup = (oldName: string, newName: string) => {
    if (newName.trim() && oldName !== newName.trim()) {
      const newExpandedGroups = new Set(expandedGroups);
      if (newExpandedGroups.has(oldName)) {
        newExpandedGroups.delete(oldName);
        newExpandedGroups.add(newName.trim());
      }
      setState({
        tests: tests.map(test =>
          test.testGroup === oldName
            ? { ...test, testGroup: newName.trim() }
            : test,
        ),
        expandedGroups: newExpandedGroups,
        hasUnsavedChanges: true,
      });
    }
  };

  const handleDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleCreateTestClick = (e: MouseEvent) => {
    e.stopPropagation();
    handleCreateTest(group);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalGroupName(e.target.value);
  };

  const handleInputBlur = () => {
    if (localGroupName.trim() && localGroupName !== groupName) {
      handleRenameGroup(groupName, localGroupName.trim());
    } else {
      setLocalGroupName(groupName);
    }
    setIsEditing(false);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
    } else if (e.key === "Escape") {
      setLocalGroupName(groupName);
      setIsEditing(false);
    }
  };

  const isExpanded = expandedGroups.has(group);
  const testCount = groupedTests[group].length || 0;
  const groupResult = getGroupResult(group, groupedTests, testResults);

  return {
    groupName,
    localGroupName,
    isEditing,
    showDeleteConfirm,
    isExpanded,
    testCount,
    groupResult,
    setIsEditing,
    toggleGroupExpanded,
    handleRunGroupClick,
    handleDeleteGroup,
    handleDeleteClick,
    handleCreateTestClick,
    handleCancelDelete,
    handleInputChange,
    handleInputBlur,
    handleInputKeyDown,
  };
}
