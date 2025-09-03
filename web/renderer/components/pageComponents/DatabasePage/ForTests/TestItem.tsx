import { Button } from "@dolthub/react-components";
import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";
import { FaPlay } from "@react-icons/all-files/fa/FaPlay";
import { FaTrash } from "@react-icons/all-files/fa/FaTrash";
import css from "./index.module.css";
import QueryEditor from "./QueryEditor";
import { MouseEvent } from "react";
import { Test } from "@gen/graphql-types";

type Props = {
  test: Test;
  groupOptions: string[],
  isExpanded: boolean;
  editingName: string | undefined;
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
  onToggleExpanded,
  onUpdateTest,
  onNameEdit,
  onNameBlur,
  onRunTest,
  onDeleteTest
}: Props) {
  console.log(groupOptions);
  return (
    <li className={`${css.item} ${css.groupedItem} ${isExpanded ? css.expanded : ''}`}>
      <div className={css.itemTop} onClick={onToggleExpanded}>
        <div className={css.testName}>
          <FaChevronRight className={css.expandIcon} />
          <input
            className={css.editableTestName}
            value={editingName ?? test.testName}
            onChange={(e) => onNameEdit(e.target.value)}
            onFocus={() => onNameEdit(test.testName)}
            onBlur={onNameBlur}
            onClick={(e) => e.stopPropagation()}
            placeholder="Test name"
          />
        </div>
        <div className={css.testActions}>
          <Button.Link
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              onRunTest();
            }}
            className={`${css.testActionBtn} ${css.runBtn}`}
            data-tooltip-content="Run test"
          >
            <FaPlay />
          </Button.Link>
          <Button.Link
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              onDeleteTest();
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
          <div className={css.fieldGroup}>
            <label className={css.fieldLabel}>Test Group</label>
            <select
              className={css.fieldSelect}
              value={test.testGroup || ""}
              onChange={(e) => onUpdateTest('testGroup', e.target.value)}
            >
              <option key="None" value="">None</option>
              {groupOptions.filter(option => option !== "").map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className={css.fieldGroup}>
            <label className={css.fieldLabel}>Query</label>
            <QueryEditor
              value={test.testQuery}
              onChange={(value) => onUpdateTest('testQuery', value)}
              placeholder="Enter SQL query"
            />
          </div>
          <div className={css.fieldGroup}>
            <label className={css.fieldLabel}>Assertion Type</label>
            <select
              className={css.fieldSelect}
              value={test.assertionType}
              onChange={(e) => onUpdateTest('assertionType', e.target.value)}
            >
              <option value="expected_rows">Expected Rows</option>
              <option value="expected_columns">Expected Columns</option>
              <option value="expected_single_value">Expected Single Value</option>
            </select>
          </div>
          <div className={css.fieldGroup}>
            <label className={css.fieldLabel}>Assertion Comparator</label>
            <select
              className={css.fieldSelect}
              value={test.assertionComparator}
              onChange={(e) => onUpdateTest('assertionComparator', e.target.value)}
            >
              <option value="==">==</option>
              <option value="!=">!=</option>
              <option value=">">&gt;</option>
              <option value="<">&lt;</option>
              <option value=">=">&gt;=</option>
              <option value="<=">&lt;=</option>
            </select>
          </div>
          <div className={css.fieldGroup}>
            <label className={css.fieldLabel}>Assertion Value</label>
            <input
              className={css.fieldInput}
              value={test.assertionValue}
              onChange={(e) => onUpdateTest('assertionValue', e.target.value)}
              placeholder="Expected result"
            />
          </div>
        </div>
      )}
    </li>
  );
}
