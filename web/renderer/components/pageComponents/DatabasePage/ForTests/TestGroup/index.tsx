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

type Props = {
  group: string;
  isExpanded: boolean;
  onToggle: () => void;
  testCount: number;
  className?: string;
  groupResult?: "passed" | "failed";
  onRunGroup: () => void;
  onDeleteGroup: () => void;
  onRenameGroup?: (oldName: string, newName: string) => void;
  onCreateTest: (groupName: string) => void;
};

export default function TestGroup({
  group,
  isExpanded,
  onToggle,
  testCount,
  className,
  groupResult,
  onRunGroup,
  onDeleteGroup,
  onRenameGroup,
  onCreateTest,
}: Props) {
  const groupName = group || "No Group";
  const [localGroupName, setLocalGroupName] = useState(groupName);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleRunGroup = (e: MouseEvent) => {
    e.stopPropagation();
    onRunGroup();
  };

  const handleDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleCreateTest = (e: MouseEvent) => {
    e.stopPropagation();
    onCreateTest(groupName);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDeleteGroup();
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalGroupName(e.target.value);
  };

  const handleInputBlur = () => {
    if (localGroupName.trim() && localGroupName !== groupName) {
      onRenameGroup?.(groupName, localGroupName.trim());
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
      onToggle();
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
          <span className={css.testCount}>({testCount} tests)</span>
        </div>
        <div className={css.groupHeaderRight}>
          {groupResult && (
            <div
              className={cx(
                css.groupResult,
                groupResult === "passed"
                  ? css.groupResultPassed
                  : css.groupResultFailed
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
            onClick={handleRunGroup}
            className={cx(css.groupActionBtn, css.runBtn)}
            data-tooltip-content={`Run all tests in ${groupName}`}
            disabled={testCount === 0}
          >
            <FaPlay />
          </Button.Link>
          <Button.Link
            onClick={handleCreateTest}
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

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Test Group"
        message={`Are you sure you want to delete the "${groupName}" test group? This will delete ${testCount} test${testCount !== 1 ? "s" : ""} in this group. This action cannot be undone.`}
        confirmText="Delete Group"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        destructive={true}
      />
    </div>
  );
}
