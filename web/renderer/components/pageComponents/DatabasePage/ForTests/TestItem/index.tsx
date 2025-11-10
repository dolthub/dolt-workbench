import { Button, FormSelect, FormInput } from "@dolthub/react-components";
import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";
import { FaPlay } from "@react-icons/all-files/fa/FaPlay";
import { FaTrash } from "@react-icons/all-files/fa/FaTrash";
import { FaCheck } from "@react-icons/all-files/fa/FaCheck";
import { FaTimes } from "@react-icons/all-files/fa/FaTimes";
import cx from "classnames";
import css from "./index.module.css";
import QueryEditor from "../QueryEditor";
import ConfirmationModal from "@pageComponents/DatabasePage/ForTests/ConfirmationModal";
import { Test } from "@gen/graphql-types";
import { useEditTestItem } from "./useEditTestItem";

type Props = {
  test: Test;
  className?: string;
};

export default function TestItem({ test, className }: Props) {
  const {
    testItemState,
    setTestItemState,
    updateTest,
    handleTestNameEdit,
    handleTestNameBlur,
    debouncedOnUpdateTest,
    handleDeleteTest,
    handleRunTest,
    groupOptions,
    isExpanded,
    editingName,
    testResult,
    toggleExpanded,
  } = useEditTestItem(test);

  return (
    <li
      className={cx(
        css.item,
        css.groupedItem,
        { [css.expanded]: isExpanded },
        className,
      )}
      id={test.testName}
    >
      <div
        className={css.itemTop}
        onClick={() => toggleExpanded(test.testName)}
      >
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
            onClick={async e => {
              e.stopPropagation();
              await handleRunTest(test.testName);
            }}
            className={cx(css.testActionBtn, css.runBtn)}
            data-tooltip-content="Run test"
          >
            <FaPlay />
          </Button.Link>
          <Button.Link
            onClick={e => {
              e.stopPropagation();
              setTestItemState({
                showDeleteConfirm: true,
              });
            }}
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
              onChangeValue={value =>
                updateTest(test.testName, "testGroup", value || "")
              }
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
              value={testItemState.localAssertionValue}
              onChangeString={s => {
                setTestItemState({
                  localAssertionValue: s,
                });
              }}
              onBlur={() => {
                if (testItemState.localAssertionValue !== test.assertionValue) {
                  updateTest(
                    test.testName,
                    "assertionValue",
                    testItemState.localAssertionValue,
                  );
                }
              }}
              placeholder="Expected result"
              className={css.fullWidthFormInput}
            />
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={testItemState.showDeleteConfirm}
        title="Delete Test"
        message={`Are you sure you want to delete the test "${test.testName}"?`}
        confirmText="Delete Test"
        onConfirm={() => {
          setTestItemState({
            showDeleteConfirm: false,
          });
          handleDeleteTest(test.testName);
        }}
        onCancel={() => {
          setTestItemState({
            showDeleteConfirm: false,
          });
        }}
        destructive={true}
      />
    </li>
  );
}
