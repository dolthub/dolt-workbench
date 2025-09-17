import {
  TestResult, useRunTestsLazyQuery,
} from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import { Button } from "@dolthub/react-components";
import cx from "classnames";
import { FiCheck } from "@react-icons/all-files/fi/FiCheck";
import { FiX } from "@react-icons/all-files/fi/FiX";
import { FiCircle } from "@react-icons/all-files/fi/FiCircle";
import TestResultsListItem, {
  TestStatusColors,
} from "./TestResultsListItem";
import css from "./index.module.css";
import { useCallback, useState } from "react";
import { Arrow } from "@pageComponents/DatabasePage/ForPulls/PullActions/Merge/Arrow";

type Props = {
  params: RefParams;
};

function TestResultsTitle({ red, green, orange, onRunTests }: TestStatusColors & { onRunTests: () => void }) {
  return (
    <>
      <div className={css.titleSection}>
        <IconSwitch
          className={css.testsStatusIcon}
          red={red}
          green={green}
          orange={orange}
        />
        Tests
      </div>
      <Button
        className={cx(css.runButton, {
          [css.greenButton]: green,
          [css.redButton]: red,
          [css.orangeButton]: orange
        })}
        onClick={onRunTests}
      >
        Run
      </Button>
    </>
  );
}

function IconSwitch({
  red,
  green,
  orange,
  className,
}: TestStatusColors & { className?: string }) {
  if (red) return <FiX className={className} />;
  if (orange) return <FiCircle className={className} />;
  if (green) return <FiCheck className={className} />;
  return null;
}

export default function TestResultsForMergeList({ params }: Props) {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [runTests]  = useRunTestsLazyQuery();

  const handleRunTests = useCallback(async () => {
    try {
      const result = await runTests({
        variables: {
          databaseName: params.databaseName,
          refName: params.refName,
        },
      });

      setTestResults(result.data?.runTests.list ?? []);

    } catch {
      setTestResults([]);
    }
  }, [runTests, params.databaseName, params.refName]);

  const { red, orange, green } = getTestStatusColors(testResults);

  return (
    <div className={css.outer}>
      <span
        className={cx(css.picContainer, {
          [css.orangeIcon]: orange,
          [css.redIcon]: red,
          [css.greenIcon]: green,
        })}
      >
        <IconSwitch red={red} green={green} orange={orange} />
      </span>
      <Arrow red={red} green={green} orange={orange} />
      <div className={css.container}>
        <div
          className={cx(css.top, {
            [css.red]: red,
            [css.green]: green,
            [css.orange]: orange,
          })}
        >
          <TestResultsTitle red={red} green={green} orange={orange} onRunTests={handleRunTests} />
        </div>
        <div
          className={cx(css.tests, {
            [css.testsRed]: red,
            [css.testsGreen]: green,
            [css.testsOrange]: orange,
          })}
        >
          <ul>
            {testResults.length > 0 ? (
              testResults.map(test => (
                <TestResultsListItem
                  test={test}
                  params={params}
                  key={test.testName}
                />
              ))
            ) : (
              <li className={css.noTests}>
                <span>No test results available. Run tests to see results here.</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function getTestStatusColors(tests: TestResult[]): TestStatusColors {
  if (tests.length === 0) {
    return {
      red: false,
      green: false,
      orange: true,
    };
  }
  
  const failedTests = tests.filter(t => t.status !== 'PASS');
  
  if (failedTests.length > 0) {
    return {
      red: true,
      green: false,
      orange: false,
    };
  }
  
  return {
    red: false,
    green: true,
    orange: false,
  };
}
