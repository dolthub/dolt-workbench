import HeaderUserCheckbox from "@components/HeaderUserCheckbox";
import { Button, SmallLoader } from "@dolthub/react-components";
import { PullDetailsFragment, useRunTestsLazyQuery, useTestListQuery } from "@gen/graphql-types";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import { ApolloErrorType } from "@lib/errors/types";
import { PullDiffParams } from "@lib/params";
import { tests } from "@lib/urls";
import { FiGitPullRequest } from "@react-icons/all-files/fi/FiGitPullRequest";
import { FiMoreHorizontal } from "@react-icons/all-files/fi/FiMoreHorizontal";
import cx from "classnames";
import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
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

        <TestRunner params={props.params} />

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

type TestRunnerProps = {
  params: PullDiffParams;
};

function TestRunner({ params }: TestRunnerProps) {
  const [testResults, setTestResults] = useState<{ status: 'passed' | 'failed' | null, failedTests?: string[] }>({ status: null });
  const { data: testsData } = useTestListQuery({
    variables: {
      databaseName: params.databaseName,
      refName: params.refName,
    },
  });
  const [runTests] = useRunTestsLazyQuery();
  const hasAutoRun = useRef(false);

  const handleRunTests = useCallback(async () => {
    if (!testsData?.tests.list.length) return;
    
    try {
      const result = await runTests({
        variables: {
          databaseName: params.databaseName,
          refName: params.refName,
        },
      });

      const testResults = result.data?.runTests.list ?? [];
      const failedTests = testResults.filter(t => t.status !== 'PASS');
      
      if (failedTests.length === 0) {
        setTestResults({ status: 'passed' });
      } else {
        setTestResults({ 
          status: 'failed', 
          failedTests: failedTests.map(t => `${t.testName}: ${t.message}`)
        });
      }
    } catch (error) {
      setTestResults({ 
        status: 'failed', 
        failedTests: ['Error running tests: ' + (error as Error).message]
      });
    }
  }, [testsData?.tests.list.length, runTests, params.databaseName, params.refName]);

  // Auto-run tests when testsData is available
  useEffect(() => {
    if (testsData?.tests.list.length && !hasAutoRun.current) {
      hasAutoRun.current = true;
      void handleRunTests();
    }
  }, [testsData?.tests.list.length, handleRunTests]);

  if (!testsData?.tests.list.length) {
    return null; // No tests available
  }

  const testsUrl = tests({ databaseName: params.databaseName, refName: params.refName }).withQuery({ runTests: 'true' });

  return (
    <div className={cx(css.testRow, {
      [css.testRowPassed]: testResults.status === 'passed',
      [css.testRowFailed]: testResults.status === 'failed'
    })}>
      <div className={css.testContent}>
        <div className={css.testInfo}>
          {testResults.status === 'passed' && (
            <span>All tests passed ({testsData.tests.list.length} tests)</span>
          )}
          {testResults.status === 'failed' && (
            <div>
              <span>Some tests failed:</span>
              <ul className={css.testErrors}>
                {testResults.failedTests?.map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          {testResults.status === null && (
            <span>Running tests to validate changes...</span>
          )}
        </div>
        <div className={css.testActions}>
          <Link href={testsUrl.href} as={testsUrl.as}>
            <button className={css.testButton} title="View test details">
              <span className={css.buttonContent}>
                <FiMoreHorizontal className={css.buttonIcon} />
                View Details
              </span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
