import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";
import { FaPlay } from "@react-icons/all-files/fa/FaPlay";
import { FaTrash } from "@react-icons/all-files/fa/FaTrash";
import { FaCheck } from "@react-icons/all-files/fa/FaCheck";
import { FaTimes } from "@react-icons/all-files/fa/FaTimes";
import { FaPlus } from "@react-icons/all-files/fa/FaPlus";
import { Button } from "@dolthub/react-components";
import { useState, KeyboardEvent, ChangeEvent, MouseEvent } from "react";
import cx from "classnames";
import css from "./index.module.css";
import ConfirmationModal from "../ConfirmationModal";
import { pluralize } from "@dolthub/web-utils";
import { useTestContext } from "../context";
import { getGroupResult } from "@pageComponents/DatabasePage/ForTests/utils";

type Props = {
  group: string;
  className?: string;
};

export default function TestGroup({ group, className }: Props) {
  const {
    tests,
    expandedGroups,
    groupedTests,
    testResults,
    emptyGroups,
    toggleGroupExpanded,
    handleRunGroup,
    setState,
    handleCreateTest,
  } = useTestContext();

  const groupName = group || "No Group";
  const [localGroupName, setLocalGroupName] = useState(groupName);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isExpanded = expandedGroups.has(group);
  const testCount = groupedTests[group].length || 0;
  const groupResult = getGroupResult(group, groupedTests, testResults);

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

  const handleHeaderClick = () => {
    if (!isEditing) {
      toggleGroupExpanded(group);
    }
  };

  return (
    <div
      className={cx(
        css.groupHeader,
        { [css.groupExpanded]: isExpanded },
        className,
      )}
      onClick={handleHeaderClick}
    >
      <div className={css.groupHeaderContent}>
        <div className={css.groupHeaderLeft}>
          <FaChevronRight className={css.groupExpandIcon} />
          <input
            className={css.inlineEditInput}
            value={localGroupName}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setIsEditing(true)}
            onClick={e => e.stopPropagation()}
          />
          <span className={css.testCount}>
            {testCount} {pluralize(testCount, "test")}
          </span>
        </div>
        <div className={css.groupHeaderRight}>
          {groupResult && (
            <div
              className={cx(
                css.groupResult,
                groupResult === "passed"
                  ? css.groupResultPassed
                  : css.groupResultFailed,
              )}
            >
              {groupResult === "passed" ? (
                <>
                  <FaCheck className={css.groupResultIcon} />
                  <span>Passed</span>
                </>
              ) : (
                <>
                  <FaTimes className={css.groupResultIcon} />
                  <span>Failed</span>
                </>
              )}
            </div>
          )}
          <Button.Link
            onClick={handleRunGroupClick}
            className={cx(css.groupActionBtn, css.runBtn)}
            data-tooltip-content={`Run all tests in ${groupName}`}
            disabled={testCount === 0}
          >
            <FaPlay />
          </Button.Link>
          <Button.Link
            onClick={handleCreateTestClick}
            className={cx(css.groupActionBtn, css.createBtn)}
            data-tooltip-content={`Add test to ${groupName}`}
          >
            <FaPlus />
          </Button.Link>
          <Button.Link
            onClick={handleDeleteClick}
            red
            className={cx(css.groupActionBtn, css.deleteBtn)}
            data-tooltip-content={`Delete ${groupName} group`}
          >
            <FaTrash />
          </Button.Link>
        </div>
      </div>

      <div className={css.confirmDeleteModal}>
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          title="Delete Test Group"
          message={`Are you sure you want to delete the "${groupName}" test group? This will delete ${testCount} test${testCount !== 1 ? "s" : ""} in this group.`}
          confirmText="Delete Group"
          onConfirm={() => handleDeleteGroup(groupName)}
          onCancel={handleCancelDelete}
          destructive={true}
        />
      </div>
    </div>
  );
}
