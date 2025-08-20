import HeaderUserCheckbox from "@components/HeaderUserCheckbox";
import { Button, SmallLoader } from "@dolthub/react-components";
import { ConflictResolveType, PullDetailsFragment } from "@gen/graphql-types";
import { ApolloErrorType } from "@lib/errors/types";
import { PullDiffParams } from "@lib/params";
import { FiGitPullRequest } from "@react-icons/all-files/fi/FiGitPullRequest";
import cx from "classnames";
import { useState } from "react";
import { Arrow } from "./Arrow";
import ErrorsWithDirections from "./ErrorsWithDirections";
import MergeConflictsDirections from "./ErrorsWithDirections/MergeConflictsDirections";
import MergeConflicts from "./MergeConflicts";
import MergeMessageTitle from "./MergeMessageTitle";
import ResolveModal from "./ResolveModal";
import css from "./index.module.css";
import useMergeButton from "./useMergeButton";

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
              merge instructions
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
  onClickWithResolve: (resolveType: ConflictResolveType) => Promise<void>;
  loading: boolean;
  params: PullDiffParams;
  err?: ApolloErrorType;
};

function MergeButton(props: MergeButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div aria-label="merge-button-container">
      {props.disabled ? (
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
          green
        >
          {props.loading ? "Merging..." : "Merge"}
        </Button>
      )}
    </div>
  );
}
