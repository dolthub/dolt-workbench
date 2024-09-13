import CommitLink from "@components/links/CommitLink";
import { Tooltip } from "@dolthub/react-components";
import { getLongDateTimeString } from "@dolthub/web-utils";
import { CommitForHistoryFragment } from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import cx from "classnames";
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

  return (
    <li
      className={cx(css.item, {
        [css.activeItem]: activeHash === commit.commitId,
      })}
      data-cy="commit-log-item"
      id={commit.commitId}
    >
      <span
        data-cy="commit-log-id-mobile"
        className={cx(css.showForMobile, css.commitId)}
      >
        {commit.commitId}
      </span>
      <div className={css.message}>
        <CommitLink params={{ ...params, ...commit }}>
          {commit.message}
        </CommitLink>
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
      </div>
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
