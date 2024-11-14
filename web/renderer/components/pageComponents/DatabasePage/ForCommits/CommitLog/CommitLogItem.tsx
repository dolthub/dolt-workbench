import CommitLink from "@components/links/CommitLink";
import { Button, ErrorMsg, Tooltip } from "@dolthub/react-components";
import { getLongDateTimeString } from "@dolthub/web-utils";
import { CommitForHistoryFragment } from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import cx from "classnames";
import { DiffSection } from "commit-graph";
import { getCommit } from "@components/CommitGraph/utils";
import { useCommitOverview } from "@hooks/useCommitListForCommitGraph/useCommitOverview";
import css from "./index.module.css";

type UserProps = {
  commit: CommitForHistoryFragment;
  depUsername?: string;
};

type Props = UserProps & {
  params: RefParams;
  activeHash?: string;
};

export default function CommitLogItem(props: Props) {
  const { commit, activeHash, params } = props;
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
  } = useCommitOverview(params);

  return (
    <li
      className={cx(css.item, {
        [css.activeItem]: activeHash === commit.commitId,
        [css.focused]: showOverview,
        [css.hovered]: showOverviewButton && !showOverview,
      })}
      data-cy="commit-log-item"
      id={commit.commitId}
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
      <span
        data-cy="commit-log-id-mobile"
        className={cx(css.showForMobile, css.commitId)}
      >
        {commit.commitId}
      </span>
      <div className={css.messageAndButton}>
        <div className={css.message}>
          <CommitLink params={{ ...params, ...commit }}>
            {commit.message}
          </CommitLink>
        </div>
        {showOverviewButton && !!commit.parents.length && (
          <Button.Link
            type="button"
            className={css.showOverviewButton}
            onClick={async () => {
              setShowOverview(true);
              const result = await getDiff(commit.parents[0], commit.commitId);
              setDiff(result);
            }}
          >
            See commit overview
          </Button.Link>
        )}
      </div>
      <div className={css.itemBottom}>
        <span>
          <User {...props} /> committed{" "}
          <span className={css.timeago} data-cy="commit-log-item-date">
            {getLongDateTimeString(new Date(commit.committedAt))}
          </span>
        </span>
        <span data-cy="commit-log-id-desktop" className={css.showForDesktop}>
          <CommitLink
            params={{ ...params, ...commit }}
            className={css.commitId}
          >
            {commit.commitId}
          </CommitLink>
        </span>
        <ErrorMsg err={err} />
      </div>
      {showOverview && (
        <div ref={diffRef}>
          <DiffSection
            commit={getCommit(commit, params)}
            diff={diffOverview}
            loading={loading}
            forDolt
          />
        </div>
      )}
    </li>
  );
}

function User(props: UserProps) {
  const { username, displayName } = props.commit.committer;
  if (props.depUsername === username) {
    return (
      <>
        <span
          className={css.user}
          data-tooltip-id="hosted-user"
          data-tooltip-content={props.depUsername}
        >
          Hosted User
        </span>
        <Tooltip id="hosted-user" place="left" />
      </>
    );
  }
  return <span className={css.user}>{username ?? displayName}</span>;
}
