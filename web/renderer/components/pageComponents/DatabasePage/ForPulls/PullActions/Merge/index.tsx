import HeaderUserCheckbox from "@components/HeaderUserCheckbox";
import { Button, SmallLoader } from "@dolthub/react-components";
import { PullDetailsFragment } from "@gen/graphql-types";
import { PullDiffParams } from "@lib/params";
import { FiGitPullRequest } from "@react-icons/all-files/fi/FiGitPullRequest";
import cx from "classnames";
import { Arrow } from "./Arrow";
import ErrorsWithDirections from "./ErrorsWithDirections";
import MergeConflictsDirections from "./ErrorsWithDirections/MergeConflictsDirections";
import MergeConflicts from "./MergeConflicts";
import MergeMessageTitle from "./MergeMessageTitle";
import css from "./index.module.css";
import useMergeButton from "./useMergeButton";

type Props = {
  params: PullDiffParams;
  pullDetails: PullDetailsFragment;
};

export default function MergeButton(props: Props) {
  const {
    hasConflicts,
    conflictsLoading,
    onClick,
    disabled,
    userHeaders,
    pullConflictsSummary,
    state,
    setState,
    mergeState,
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
          <div aria-label="merge-button-container">
            <Button
              className={css.merge}
              onClick={onClick}
              disabled={disabled}
              data-cy="merge-button"
              green
            >
              {mergeState.loading ? "Merging..." : "Merge"}
            </Button>
          </div>
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
