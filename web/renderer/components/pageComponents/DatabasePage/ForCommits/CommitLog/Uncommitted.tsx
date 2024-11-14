import Link from "@components/links/Link";
import { Button, ErrorMsg, Loader } from "@dolthub/react-components";
import {
  CommitForHistoryFragment,
  StatusFragment,
  useGetStatusQuery,
} from "@gen/graphql-types";
import { RefParams, RequiredCommitsParams } from "@lib/params";
import { diff } from "@lib/urls";
import cx from "classnames";
import { DiffSection } from "commit-graph";
import { getCommit } from "@components/CommitGraph/utils";
import { useCommitOverview } from "@hooks/useCommitListForCommitGraph/useCommitOverview";
import css from "./index.module.css";

type Props = {
  params: RefParams;
};

type InnerProps = Props & {
  status: StatusFragment[];
};

type ItemProps = {
  params: RequiredCommitsParams & { refName: string };
};

function Item(props: ItemProps) {
  const {
    showOverview,
    showOverviewButton,
    setShowOverview,
    setShowOverviewButton,
    err,
    getDiff,
    loading,
    setDiff,
    diffRef,
    diffOverview,
  } = useCommitOverview(props.params);
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
        [css.focused]: showOverview,
        [css.hovered]: showOverviewButton && !showOverview,
      })}
      id={props.params.toCommitId}
      data-cy="commit-log-item-uncommitted"
      onMouseOver={() => {
        setShowOverviewButton(true);
      }}
      onFocus={() => {
        setShowOverviewButton(true);
      }}
      onMouseLeave={() => {
        setShowOverviewButton(false);
      }}
    >
      <div className={css.messageAndButton}>
        <Link {...diff(props.params)}>{props.params.toCommitId}</Link>
        <ErrorMsg err={err} />
        {showOverviewButton && (
          <Button.Link
            type="button"
            className={css.showOverviewButton}
            onClick={async () => {
              setShowOverview(true);
              const result = await getDiff(
                props.params.fromCommitId,
                props.params.toCommitId,
              );
              setDiff(result);
            }}
          >
            See commit overview
          </Button.Link>
        )}
      </div>
      {showOverview && (
        <div ref={diffRef}>
          <DiffSection
            commit={getCommit(commit, props.params)}
            diff={diffOverview}
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
          params={{
            ...props.params,
            toCommitId: "WORKING",
            fromCommitId: "STAGED",
          }}
        />
      )}
      {hasStagedChanges && (
        <Item
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
  const res = useGetStatusQuery({ variables: props.params });
  if (res.loading) return <Loader loaded={false} />;
  if (res.error || !res.data || res.data.status.length === 0) {
    return null;
  }
  return <Inner {...props} status={res.data.status} />;
}
