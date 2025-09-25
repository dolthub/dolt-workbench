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
    isExpanded,
    testCount,
    groupResult,
    testGroupState,
    setTestGroupState,
    toggleGroupExpanded,
    handleCreateTest,
    handleRunGroup,
    handleDeleteGroup,
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
        if (!testGroupState.isEditing) {
          toggleGroupExpanded(group);
        }
      }}
    >
      <div className={css.groupHeaderContent}>
        <div className={css.groupHeaderLeft}>
          <FaChevronRight className={css.groupExpandIcon} />
          <input
            className={css.inlineEditInput}
            value={testGroupState.localGroupName}
            onChange={e => {
              setTestGroupState({
                localGroupName: e.target.value,
              });
            }}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setTestGroupState({ isEditing: true })}
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
            onClick={async e => {
              e.stopPropagation();
              await handleRunGroup(group);
            }}
            className={cx(css.groupActionBtn, css.runBtn)}
            data-tooltip-content={`Run all tests in ${groupName}`}
            disabled={testCount === 0}
          >
            <FaPlay />
          </Button.Link>
          <Button.Link
            onClick={e => {
              e.stopPropagation();
              handleCreateTest(group);
            }}
            className={cx(css.groupActionBtn, css.createBtn)}
            data-tooltip-content={`Add test to ${groupName}`}
          >
            <FaPlus />
          </Button.Link>
          <Button.Link
            onClick={e => {
              e.stopPropagation();
              setTestGroupState({
                showDeleteConfirm: true,
              });
            }}
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
          isOpen={testGroupState.showDeleteConfirm}
          title="Delete Test Group"
          message={`Are you sure you want to delete the "${groupName}" test group? This will delete ${testCount} test${testCount !== 1 ? "s" : ""} in this group.`}
          confirmText="Delete Group"
          onConfirm={() => handleDeleteGroup(groupName)}
          onCancel={() => {
            setTestGroupState({
              showDeleteConfirm: false,
            });
          }}
          destructive={true}
        />
      </div>
    </div>
  );
}
