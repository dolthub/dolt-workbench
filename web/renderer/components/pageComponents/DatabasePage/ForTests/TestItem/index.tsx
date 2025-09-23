import { Button, FormSelect, FormInput } from "@dolthub/react-components";
import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";
import { FaPlay } from "@react-icons/all-files/fa/FaPlay";
import { FaTrash } from "@react-icons/all-files/fa/FaTrash";
import { FaCheck } from "@react-icons/all-files/fa/FaCheck";
import { FaTimes } from "@react-icons/all-files/fa/FaTimes";
import cx from "classnames";
import css from "./index.module.css";
import QueryEditor from "../QueryEditor";
import { MouseEvent, useState, useRef, useEffect, useCallback } from "react";
import ConfirmationModal from "@pageComponents/DatabasePage/ForTests/ConfirmationModal";
import { useTestContext } from "../context";
import { Test } from "@gen/graphql-types";

type Props = {
  test: Test;
  className?: string;
};

export default function TestItem({
  test,
  className,
}: Props) {
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

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [localAssertionValue, setLocalAssertionValue] = useState(
    test.assertionValue,
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateTest = useCallback((name: string, field: keyof Test, value: string) => {
    setState({
      tests: tests.map((test: Test) =>
        test.testName === name ? { ...test, [field]: value } : test,
      ),
      hasUnsavedChanges: true,
    });
  }, [tests, setState]);

  const handleDeleteTest = (testName: string) => {
    const newExpandedItems = new Set(expandedItems);
    newExpandedItems.delete(testName);
    setState({
      tests: tests.filter(test => test.testName !== testName),
      expandedItems: newExpandedItems,
      hasUnsavedChanges: true,
    });
  };

  const handleTestNameEdit = (testId: string, name: string) => {
    setState({
      editingTestNames: {
        ...editingTestNames,
        [testId]: name,
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
  }

  const groupOptions = sortedGroupEntries
    .map(entry => entry[0])
    .filter(group => group !== "");
  const isExpanded = expandedItems.has(test.testName);
  const editingName = editingTestNames[test.testName];
  const testResult = testResults[test.testName];

  const debouncedOnUpdateTest = (
    (field: keyof Test, value: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        updateTest(test.testName, field, value);
      }, 500); // 500ms debounce
    }
  );

  useEffect(
    () => () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    setLocalAssertionValue(test.assertionValue);
  }, [test.assertionValue]);

  const handleDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    handleDeleteTest(test.testName);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleAssertionValueBlur = () => {
    if (localAssertionValue !== test.assertionValue) {
      updateTest(test.testName, "assertionValue", localAssertionValue);
    }
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
      <div className={css.itemTop} onClick={() => toggleExpanded(test.testName)}>
        <div className={css.testName}>
          <FaChevronRight className={css.expandIcon} />
          <input
            className={css.editableTestName}
            value={editingName || test.testName}
            onChange={e => handleTestNameEdit(test.testName, e.target.value)}
            onFocus={() => handleTestNameEdit(test.testName, test.testName)}
            onBlur={() => handleTestNameBlur(test.testName)}
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
            onClick={async (e: MouseEvent) => {
              e.stopPropagation();
              await handleRunTest(test.testName);
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
              onChangeValue={value => updateTest(test.testName, "testGroup", value || "")}
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
                updateTest(test.testName, "assertionType", value || "")
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
                updateTest(test.testName, "assertionComparator", value || "")
              }
            />
          </div>
          <div className={css.fieldGroup}>
            <FormInput
              label="Assertion Value"
              value={localAssertionValue}
              onChangeString={setLocalAssertionValue}
              onBlur={handleAssertionValueBlur}
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
