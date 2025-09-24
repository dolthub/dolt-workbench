import { RefParams } from "@lib/params";
import { useCallback, useState } from "react";
import {
  TestResult,
  useRunTestsLazyQuery,
  useTestListQuery,
} from "@gen/graphql-types";
import css from "./index.module.css";
import { Button, SmallLoader } from "@dolthub/react-components";
import cx from "classnames";
import { Arrow } from "@pageComponents/DatabasePage/ForPulls/PullActions/Merge/Arrow";
import { TestResultsListItem } from "@pageComponents/DatabasePage/ForPulls/PullActions/Merge/TestResults/TestResultsListItem";
import { FiX } from "@react-icons/all-files/fi/FiX";
import { FiCircle } from "@react-icons/all-files/fi/FiCircle";
import { FiCheck } from "@react-icons/all-files/fi/FiCheck";

type TestStatusColors = {
  red: boolean;
  orange: boolean;
  green: boolean;
};

export function TestResults({ params }: { params: RefParams }) {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [runTestError, setRunTestError] = useState<string | null>(null);
  const [runTests, { error: runTestsError }] = useRunTestsLazyQuery();
  const { data, loading, error } = useTestListQuery({
    variables: {
      databaseName: params.databaseName,
      refName: params.refName,
    },
  });

  const handleRunTests = useCallback(async () => {
    setRunTestError(null);
    try {
      const result = await runTests({
        variables: {
          databaseName: params.databaseName,
          refName: params.refName,
        },
      });

      if (result.error) {
        console.error("Error running tests:", result.error);
        setRunTestError(result.error.message);
        setTestResults([]);
        return;
      }

      setTestResults(result.data?.runTests.list ?? []);
    } catch (err) {
      console.error("Error running tests:", err);
      setRunTestError(
        err instanceof Error ? err.message : "Failed to run tests",
      );
      setTestResults([]);
    }
  }, [runTests, params.databaseName, params.refName]);

  if (loading) {
    return (
      <div className={css.testResultsOuter}>
        <SmallLoader.WithText text="Loading tests..." loaded={false} />
      </div>
    );
  }

  if (error) {
    console.error("Error loading test list:", error);
    return (
      <div className={css.testResultsOuter}>
        <div className={css.testResultsContainer}>
          <div className={css.testResultsTop}>
            <span style={{ color: "red" }}>
              Failed to load tests: {error.message}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (runTestsError) {
    console.error("Run Tests query error:", runTestsError);
  }

  if (!data?.tests.list || data.tests.list.length === 0) {
    return null;
  }

  const { red, orange, green } = getTestStatusColors(testResults);

  return (
    <div className={css.testResultsOuter}>
      <span
        className={cx(css.testResultsPicContainer, {
          [css.testResultsOrangeIcon]: orange,
          [css.testResultsRedIcon]: red,
          [css.testResultsGreenIcon]: green,
        })}
      >
        <TestResultsIconSwitch red={red} green={green} orange={orange} />
      </span>
      <Arrow red={red} green={green} orange={orange} />
      <div className={css.testResultsContainer}>
        <div
          className={cx(css.testResultsTop, {
            [css.testResultsRed]: red,
            [css.testResultsGreen]: green,
            [css.testResultsOrange]: orange,
          })}
        >
          <TestResultsTitle
            red={red}
            green={green}
            orange={orange}
            onRunTests={handleRunTests}
          />
        </div>
        <div
          className={cx(css.testResultsTests, {
            [css.testResultsTestsRed]: red,
            [css.testResultsTestsGreen]: green,
            [css.testResultsTestsOrange]: orange,
          })}
        >
          {(runTestError || runTestsError) && (
            <div style={{ color: "red", padding: "8px" }}>
              Error running tests: {runTestError || runTestsError?.message}
            </div>
          )}
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
              <li className={css.testResultsNoTests}>
                <span>Run tests to see results here.</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

function TestResultsTitle({
  red,
  green,
  orange,
  onRunTests,
}: TestStatusColors & { onRunTests: () => void }) {
  return (
    <>
      <div className={css.testResultsTitleSection}>
        <TestResultsIconSwitch
          className={css.testResultsTestsStatusIcon}
          red={red}
          green={green}
          orange={orange}
        />
        Tests
      </div>
      <Button
        className={cx(css.testResultsRunButton, {
          [css.testResultsGreenButton]: green,
          [css.testResultsRedButton]: red,
          [css.testResultsOrangeButton]: orange,
        })}
        onClick={onRunTests}
      >
        Run
      </Button>
    </>
  );
}

function TestResultsIconSwitch({
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

function getTestStatusColors(tests: TestResult[]): TestStatusColors {
  if (tests.length === 0) {
    return {
      red: false,
      green: false,
      orange: true,
    };
  }

  const failedTests = tests.filter(t => t.status !== "PASS");

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
