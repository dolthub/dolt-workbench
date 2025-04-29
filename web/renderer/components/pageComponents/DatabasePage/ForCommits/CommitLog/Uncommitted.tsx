import { getCommit } from "@components/CommitGraph/utils";
import Link from "@components/links/Link";
import ResetModal from "@components/StatusWithOptions/ResetModal";
import { Button, ErrorMsg, Loader, Tooltip } from "@dolthub/react-components";
import {
  CommitForHistoryFragment,
  StatusFragment,
  useGetStatusQuery,
} from "@gen/graphql-types";
import { useCommitOverview } from "@hooks/useCommitListForCommitGraph/useCommitOverview";
import { RefParams, RequiredCommitsParams } from "@lib/params";
import { diff } from "@lib/urls";
import { FaCaretDown } from "@react-icons/all-files/fa/FaCaretDown";
import cx from "classnames";
import { DiffSection } from "commit-graph";
import { useState } from "react";
import css from "./index.module.css";

type Props = {
  params: RefParams;
};

type InnerProps = Props & {
  status: StatusFragment[];
};

type ItemProps = {
  status: StatusFragment[];
  params: RequiredCommitsParams & { refName: string };
};

function Item(props: ItemProps) {
  const { state, setState, err, getDiff, loading, diffRef } = useCommitOverview(
    props.params,
  );
  const [resetIsOpen, setResetIsOpen] = useState(false);
  const commit: CommitForHistoryFragment = {
    ...props.params,
    _id: props.params.toCommitId,
    commitId: props.params.toCommitId,
    message: "Uncommitted changes",
    parents: [props.params.fromCommitId],
    committedAt: "",
    committer: {
      _id: "",
      displayName: "",
      emailAddress: "",
    },
  };

  return (
    <li
      className={cx(css.item, {
        [css.focused]: state.showOverview,
        [css.hovered]: state.showOverviewButton && !state.showOverview,
      })}
      id={props.params.toCommitId}
      data-cy="commit-log-item-uncommitted"
      onMouseOver={() => {
        setState({ showOverviewButton: true });
      }}
      onFocus={() => {
        setState({ showOverviewButton: true });
      }}
      onMouseLeave={() => {
        setState({ showOverviewButton: false });
      }}
    >
      <div className={css.messageAndButton}>
        <Link {...diff(props.params)}>{props.params.toCommitId}</Link>
        <ErrorMsg err={err} />
        <div className={css.uncommittedRight}>
          <Button.Link
            type="button"
            className={cx(css.showOverviewButton, {
              [css.hideOverviewButton]: !state.showOverviewButton,
            })}
            onClick={async () => {
              setState({ showOverview: true });
              const result = await getDiff(
                props.params.fromCommitId,
                props.params.toCommitId,
              );
              setState({ diffOverview: result });
            }}
          >
            See commit overview
          </Button.Link>
          <Button.Link
            onClick={() => setResetIsOpen(true)}
            data-tooltip-id="reset-changes"
            data-tooltip-content="Reset uncommitted changes"
            className={css.resetButton}
          >
            <FaCaretDown />
            <Tooltip id="reset-changes" />
          </Button.Link>
        </div>
        <ResetModal
          {...props}
          isOpen={resetIsOpen}
          setIsOpen={setResetIsOpen}
        />
      </div>
      {state.showOverview && (
        <div ref={diffRef}>
          <DiffSection
            commit={getCommit(commit, props.params)}
            diff={state.diffOverview}
            loading={loading}
            forDolt
          />
        </div>
      )}
    </li>
  );
}

function Inner(props: InnerProps) {
  const hasStagedChanges = props.status.some(s => s.staged);
  const hasWorkingChanges = props.status.some(s => !s.staged);
  return (
    <ol className={cx(css.list, css.uncommittedList)}>
      <li className={css.header}>
        <span className={css.bullet} />
        Uncommitted changes
      </li>
      {hasWorkingChanges && (
        <Item
          status={props.status}
          params={{
            ...props.params,
            toCommitId: "WORKING",
            fromCommitId: "STAGED",
          }}
        />
      )}
      {hasStagedChanges && (
        <Item
          status={props.status}
          params={{
            ...props.params,
            toCommitId: "STAGED",
            fromCommitId: "HEAD",
          }}
        />
      )}
    </ol>
  );
}

export default function Uncommitted(props: Props) {
  const res = useGetStatusQuery({
    variables: props.params,
    fetchPolicy: "cache-and-network",
  });
  if (res.loading) return <Loader loaded={false} />;
  if (res.error || !res.data || res.data.status.length === 0) {
    return null;
  }
  return <Inner {...props} status={res.data.status} />;
}
