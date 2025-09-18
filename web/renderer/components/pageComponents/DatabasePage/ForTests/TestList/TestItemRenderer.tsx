import TestItem from "@pageComponents/DatabasePage/ForTests/TestItem";
import { getTestStatusColors, getStatusClassName } from "./statusUtils";
import css from "./index.module.css";
import { Test } from "@gen/graphql-types";

type Props = {
  tests: Test[];
  uniqueGroups: string[];
  expandedItems: Set<string>;
  editingTestNames: Record<string, string>;
  testResults: Record<string, { status: "passed" | "failed"; error?: string } | undefined>;
  onToggleExpanded: (testName: string) => void;
  onUpdateTest: (testName: string, field: keyof Test, value: string) => void;
  onNameEdit: (testName: string, name: string) => void;
  onNameBlur: (testName: string) => void;
  onRunTest: (testName: string) => Promise<void>;
  onDeleteTest: (testName: string) => Promise<void>;
};

export default function TestItemRenderer({
  tests,
  uniqueGroups,
  expandedItems,
  editingTestNames,
  testResults,
  onToggleExpanded,
  onUpdateTest,
  onNameEdit,
  onNameBlur,
  onRunTest,
  onDeleteTest,
}: Props) {
  return (
    <>
      {tests.map(test => {
        const testStatusColors = getTestStatusColors(testResults[test.testName]);
        const statusClassName = getStatusClassName(testStatusColors, {
          green: css.greenTest,
          red: css.redTest,
          orange: css.orangeTest,
        });

        return (
          <TestItem
            key={test.testName}
            test={test}
            groupOptions={uniqueGroups}
            isExpanded={expandedItems.has(test.testName)}
            editingName={editingTestNames[test.testName]}
            testResult={testResults[test.testName]}
            className={statusClassName}
            onToggleExpanded={() => onToggleExpanded(test.testName)}
            onUpdateTest={(field, value) => onUpdateTest(test.testName, field, value)}
            onNameEdit={name => onNameEdit(test.testName, name)}
            onNameBlur={() => onNameBlur(test.testName)}
            onRunTest={async () => await onRunTest(test.testName)}
            onDeleteTest={async () => await onDeleteTest(test.testName)}
          />
        );
      })}
    </>
  );
}