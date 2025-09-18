import { Button, FormSelect, FormInput } from "@dolthub/react-components";
import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";
import { FaPlay } from "@react-icons/all-files/fa/FaPlay";
import { FaTrash } from "@react-icons/all-files/fa/FaTrash";
import { FaCheck } from "@react-icons/all-files/fa/FaCheck";
import { FaTimes } from "@react-icons/all-files/fa/FaTimes";
import cx from "classnames";
import css from "./index.module.css";
import QueryEditor from "../QueryEditor";
import { MouseEvent, useState, useCallback, useRef, useEffect } from "react";
import { Test } from "@gen/graphql-types";
import ConfirmationModal from "@pageComponents/DatabasePage/ForTests/ConfirmationModal";

type Props = {
  test: Test;
  groupOptions: string[];
  isExpanded: boolean;
  editingName: string | undefined;
  testResult?: { status: "passed" | "failed"; error?: string };
  className?: string;
  onToggleExpanded: () => void;
  onUpdateTest: (field: keyof Test, value: string) => void;
  onNameEdit: (name: string) => void;
  onNameBlur: () => void;
  onRunTest: () => void;
  onDeleteTest: () => void;
};

export default function TestItem({
  test,
  groupOptions,
  isExpanded,
  editingName,
  testResult,
  className,
  onToggleExpanded,
  onUpdateTest,
  onNameEdit,
  onNameBlur,
  onRunTest,
  onDeleteTest,
}: Props) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedOnUpdateTest = useCallback(
    (field: keyof Test, value: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onUpdateTest(field, value);
      }, 500); // 500ms debounce
    },
    [onUpdateTest],
  );

  useEffect(
    () => () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    },
    [],
  );

  const handleDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDeleteTest();
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <li
      className={cx(
        css.item,
        css.groupedItem,
        { [css.expanded]: isExpanded },
        className,
      )}
      data-test-name={test.testName}
    >
      <div className={css.itemTop} onClick={onToggleExpanded}>
        <div className={css.testName}>
          <FaChevronRight className={css.expandIcon} />
          <input
            className={css.editableTestName}
            value={editingName ?? test.testName}
            onChange={e => onNameEdit(e.target.value)}
            onFocus={() => onNameEdit(test.testName)}
            onBlur={onNameBlur}
            onClick={e => e.stopPropagation()}
            placeholder="Test name"
          />
        </div>
        {testResult && (
          <div
            className={cx(
              css.testResult,
              testResult.status === "passed"
                ? css.testResultPassed
                : css.testResultFailed,
            )}
          >
            {testResult.status === "passed" ? (
              <>
                <FaCheck className={css.testResultIcon} />
                <span>Passed</span>
              </>
            ) : (
              <>
                <FaTimes className={css.testResultIcon} />
                <span>Failed</span>
              </>
            )}
          </div>
        )}
        <div className={css.testActions}>
          <Button.Link
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              onRunTest();
            }}
            className={cx(css.testActionBtn, css.runBtn)}
            data-tooltip-content="Run test"
          >
            <FaPlay />
          </Button.Link>
          <Button.Link
            onClick={handleDeleteClick}
            red
            className={css.testActionBtn}
            data-tooltip-content="Delete test"
          >
            <FaTrash />
          </Button.Link>
        </div>
      </div>
      {isExpanded && (
        <div className={css.expandedContent}>
          {testResult?.status === "failed" && testResult.error && (
            <div className={css.errorMessage}>
              <strong>Error:</strong> {testResult.error}
            </div>
          )}
          <div className={css.separator}></div>
          <div className={css.fieldGroup}>
            <FormSelect
              label="Test Group"
              options={[
                { value: "", label: "None" },
                ...groupOptions
                  .filter(option => option !== "")
                  .map(option => {
                    return {
                      value: option,
                      label: option,
                    };
                  }),
              ]}
              val={test.testGroup || ""}
              onChangeValue={value => onUpdateTest("testGroup", value || "")}
            />
          </div>
          <div className={css.fieldGroup}>
            <label className={css.fieldLabel}>Query</label>
            <QueryEditor
              value={test.testQuery}
              onChange={value => debouncedOnUpdateTest("testQuery", value)}
              placeholder="Enter SQL query"
            />
          </div>
          <div className={css.fieldGroup}>
            <FormSelect
              label="Assertion Type"
              options={[
                { value: "expected_rows", label: "Expected Rows" },
                { value: "expected_columns", label: "Expected Columns" },
                {
                  value: "expected_single_value",
                  label: "Expected Single Value",
                },
              ]}
              val={test.assertionType}
              onChangeValue={value =>
                onUpdateTest("assertionType", value || "")
              }
            />
          </div>
          <div className={css.fieldGroup}>
            <FormSelect
              label="Assertion Comparator"
              options={[
                { value: "==", label: "==" },
                { value: "!=", label: "!=" },
                { value: ">", label: ">" },
                { value: "<", label: "<" },
                { value: ">=", label: ">=" },
                { value: "<=", label: "<=" },
              ]}
              val={test.assertionComparator}
              onChangeValue={value =>
                onUpdateTest("assertionComparator", value || "")
              }
            />
          </div>
          <div className={css.fieldGroup}>
            <FormInput
              label="Assertion Value"
              value={test.assertionValue}
              onChangeString={value => onUpdateTest("assertionValue", value)}
              placeholder="Expected result"
              className={css.fullWidthFormInput}
            />
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Test"
        message={`Are you sure you want to delete the test "${test.testName}"?`}
        confirmText="Delete Test"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        destructive={true}
      />
    </li>
  );
}
