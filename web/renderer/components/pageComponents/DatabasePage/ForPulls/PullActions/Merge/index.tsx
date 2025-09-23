import { useCallback, useState } from "react";
import HeaderUserCheckbox from "@components/HeaderUserCheckbox";
import { Button, SmallLoader } from "@dolthub/react-components";
import {
  PullDetailsFragment,
  TestResult,
  useRunTestsLazyQuery,
  useTestListQuery,
} from "@gen/graphql-types";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import { ApolloErrorType } from "@lib/errors/types";
import { PullDiffParams, RefParams } from "@lib/params";
import { FiGitPullRequest } from "@react-icons/all-files/fi/FiGitPullRequest";
import { FiCheck } from "@react-icons/all-files/fi/FiCheck";
import { FiX } from "@react-icons/all-files/fi/FiX";
import { FiCircle } from "@react-icons/all-files/fi/FiCircle";
import { excerpt } from "@dolthub/web-utils";
import Link from "@components/links/Link";
import { tests as testsUrl } from "@lib/urls";
import cx from "classnames";
import { Arrow } from "./Arrow";
import ErrorsWithDirections from "./ErrorsWithDirections";
import MergeConflictsDirections from "./ErrorsWithDirections/MergeConflictsDirections";
import MergeConflicts from "./MergeConflicts";
import MergeMessageTitle from "./MergeMessageTitle";
import ResolveModal from "./ResolveModal";
import css from "./index.module.css";
import useMergeButton, { MergeButtonState } from "./useMergeButton";

type Props = {
  params: PullDiffParams;
  pullDetails: PullDetailsFragment;
};

export default function Merge(props: Props) {
  const {
    hasConflicts,
    conflictsLoading,
    onClick,
    onClickWithResolve,
    disabled,
    userHeaders,
    pullConflictsSummary,
    state,
    setState,
    mergeState,
    resolveState,
  } = useMergeButton(props.params);
  const red = hasConflicts;

  return (
    <div className={css.wrapper}>
      <div className={css.mergeDetails}>
        <TestResults params={props.params} />
        <div className={css.outer}>
          <span className={cx(css.picContainer, { [css.redIcon]: red })}>
            <FiGitPullRequest />
          </span>
          <Arrow red={red} green={!red} />
          <div className={css.container}>
            <div className={cx(css.top, { [css.red]: red })}>
              <MergeMessageTitle hasConflicts={hasConflicts} />
              <MergeButton
                disabled={disabled}
                onClick={onClick}
                onClickWithResolve={onClickWithResolve}
                loading={resolveState.loading}
                err={resolveState.err}
                params={props.params}
                state={state}
                setState={setState}
              />
              {mergeState.err && (
                <ErrorsWithDirections
                  mergeErr={mergeState.err}
                  setShowDirections={s => setState({ showDirections: s })}
                />
              )}
            </div>

            <div className={cx(css.msg, { [css.msgRed]: red })}>
              <HeaderUserCheckbox
                shouldAddAuthor={state.addAuthor}
                setShouldAddAuthor={a => setState({ addAuthor: a })}
                userHeaders={userHeaders}
                className={css.userCheckbox}
                kind="merge commit"
              />
              <SmallLoader.WithText
                text="Checking for merge conflicts..."
                loaded={!conflictsLoading}
                outerClassName={css.conflictsLoader}
              />
              {hasConflicts && (
                <MergeConflicts
                  params={props.params}
                  conflictsSummary={pullConflictsSummary ?? undefined}
                />
              )}
              <span className={css.toggle}>
                View{" "}
                <Button.Link
                  onClick={() =>
                    setState({ showDirections: !state.showDirections })
                  }
                >
                  manual merge instructions
                </Button.Link>
                .
              </span>
              {state.showDirections && <MergeConflictsDirections {...props} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type MergeButtonProps = {
  disabled: boolean;
  onClick: () => Promise<void>;
  onClickWithResolve: () => Promise<void>;
  loading: boolean;
  params: PullDiffParams;
  err?: ApolloErrorType;
  state: MergeButtonState;
  setState: (s: Partial<MergeButtonState>) => void;
};

function MergeButton(props: MergeButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { isPostgres } = useDatabaseDetails();

  return (
    <div aria-label="merge-button-container">
      {props.disabled && !isPostgres ? (
        <>
          <Button
            className={css.merge}
            onClick={() => setModalOpen(true)}
            data-cy="merge-resolve-button"
          >
            {props.loading ? "Merging..." : "Resolve conflicts and merge"}
          </Button>
          <ResolveModal
            {...props}
            isOpen={modalOpen}
            setIsOpen={setModalOpen}
          />
        </>
      ) : (
        <Button
          className={css.merge}
          onClick={props.onClick}
          data-cy="merge-button"
          disabled={props.disabled}
          green
        >
          {props.loading ? "Merging..." : "Merge"}
        </Button>
      )}
    </div>
  );
}

type TestStatusColors = {
  red: boolean;
  orange: boolean;
  green: boolean;
};

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

function TestTitle({ test }: { test: TestResult }) {
  return (
    <div className={css.testResultsTestTitle}>
      <span className={css.testResultsTestName}>
        {excerpt(test.testName, 50)}
      </span>
      {test.message && (
        <span className={css.testResultsTestMessage}>
          {excerpt(test.message, 100)}
        </span>
      )}
    </div>
  );
}

function TestResultsListItemIconSwitch({ test }: { test: TestResult }) {
  if (test.status === "PASS") {
    return <FiCheck className={css.testResultsSuccessIcon} />;
  }
  return <FiX className={css.testResultsFailureIcon} />;
}

function TestResultsListItem({
  test,
  params,
}: {
  test: TestResult;
  params: RefParams;
}) {
  const isSuccess = test.status === "PASS";
  const isFailure = !isSuccess;

  return (
    <li>
      <Link
        {...testsUrl(params)
          .withQuery({ runTests: "true" })
          .withHash(encodeURIComponent(test.testName))}
        className={cx(
          css.testResultsItemContainer,
          css.testResultsLinkContent,
          {
            [css.testResultsRed]: isFailure,
            [css.testResultsGreen]: isSuccess,
          },
        )}
        data-test-name={test.testName}
      >
        <div className={css.testResultsIcon}>
          <TestResultsListItemIconSwitch test={test} />
        </div>
        <div className={css.testResultsContent}>
          <TestTitle test={test} />
        </div>
      </Link>
    </li>
  );
}

function TestResults({ params }: { params: RefParams }) {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [runTests] = useRunTestsLazyQuery();
  const { data } = useTestListQuery({
    variables: {
      databaseName: params.databaseName,
      refName: params.refName,
    },
  });

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
