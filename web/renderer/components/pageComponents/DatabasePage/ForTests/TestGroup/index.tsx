import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";
import { FaPlay } from "@react-icons/all-files/fa/FaPlay";
import { FaTrash } from "@react-icons/all-files/fa/FaTrash";
import { FaCheck } from "@react-icons/all-files/fa/FaCheck";
import { FaTimes } from "@react-icons/all-files/fa/FaTimes";
import { FaPlus } from "@react-icons/all-files/fa/FaPlus";
import { Button } from "@dolthub/react-components";
import cx from "classnames";
import css from "./index.module.css";
import ConfirmationModal from "../ConfirmationModal";
import { pluralize } from "@dolthub/web-utils";
import { useEditTestGroup } from "./useEditTestGroup";

type Props = {
  group: string;
  className?: string;
};

export default function TestGroup({ group, className }: Props) {
  const {
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
  } = useEditTestGroup(group);

  return (
    <div
      className={cx(
        css.groupHeader,
        { [css.groupExpanded]: isExpanded },
        className,
      )}
      onClick={() => {
        if (!isEditing) {
          toggleGroupExpanded(group);
        }
      }}
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
