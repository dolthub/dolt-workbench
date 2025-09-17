import HeaderUserCheckbox from "@components/HeaderUserCheckbox";
import { Button, SmallLoader } from "@dolthub/react-components";
import { PullDetailsFragment, useRunTestsLazyQuery, useTestListQuery } from "@gen/graphql-types";
import useDatabaseDetails from "@hooks/useDatabaseDetails";
import { ApolloErrorType } from "@lib/errors/types";
import { PullDiffParams } from "@lib/params";
import { tests } from "@lib/urls";
import { FiGitPullRequest } from "@react-icons/all-files/fi/FiGitPullRequest";
import { FiChevronDown } from "@react-icons/all-files/fi/FiChevronDown";
import cx from "classnames";
import { useState, useCallback, useRef, useEffect } from "react";
import { Arrow } from "./Arrow";
import ErrorsWithDirections from "./ErrorsWithDirections";
import MergeConflictsDirections from "./ErrorsWithDirections/MergeConflictsDirections";
import MergeConflicts from "./MergeConflicts";
import MergeMessageTitle from "./MergeMessageTitle";
import ResolveModal from "./ResolveModal";
import css from "./index.module.css";
import useMergeButton, { MergeButtonState } from "./useMergeButton";
import Link from "@components/links/Link";
import TestResultsListItem from "@components/TestResultsForMergeList/TestResultsListItem";
import TestResultsForMergeList from "@components/TestResultsForMergeList";

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
      <TestResultsForMergeList params={props.params} />
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

type TestRunnerProps = {
  params: PullDiffParams;
};

function TestRunner({ params }: TestRunnerProps) {
  return (
    <TestResultsForMergeList params={params} />
  )
}

type TestDropdownProps = {
  onRunTests: () => Promise<void>;
  testsUrl: any;
};

function TestDropdown({ onRunTests, testsUrl }: TestDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleRunTests = () => {
    setIsOpen(false);
    void onRunTests();
  };

  return (
    <div className={css.dropdown}>
      <Button
        className={cx(css.merge, css.dropdownButton)}
        onClick={() => setIsOpen(!isOpen)}
      >
        Run <FiChevronDown className={cx(css.chevron, { [css.chevronOpen]: isOpen })} />
      </Button>
      {isOpen && (
        <div className={css.dropdownMenu}>
          <button className={css.dropdownItem} onClick={handleRunTests}>
            Run Tests
          </button>
          <Link {...testsUrl} className={css.dropdownLink}>
            View Details
          </Link>
        </div>
      )}
    </div>
  );
}
