import CommitLink from "@components/links/CommitLink";
import { CommitForAfterCommitHistoryFragment } from "@gen/graphql-types";
import { RefParams } from "@lib/params";
import { pluralize } from "@lib/pluralize";
import ReactTimeago from "react-timeago";
import css from "./index.module.css";

type InnerProps = {
  params: RefParams;
  toCommitInfo: CommitForAfterCommitHistoryFragment;
};

export default function Inner({ toCommitInfo, params }: InnerProps) {
  const { parents } = toCommitInfo;
  const parentLen = parents.length;
  return (
    <div className={css.container} data-cy="commit-info">
      <div className={css.top}>
        <div data-cy="viewing-message">
          Viewing changes from{" "}
          <span className={css.hash}>{toCommitInfo.commitId}</span>
        </div>
      </div>
      <div className={css.infoContainer}>
        <div data-cy="commit-message" className={css.commitMsg}>
          {toCommitInfo.message}
        </div>
        <div className={css.committer}>
          <span className={css.userLink}>
            {toCommitInfo.committer.displayName}
          </span>{" "}
          committed <ReactTimeago date={toCommitInfo.committedAt} />
        </div>
        <div>
          {parentLen} {pluralize(parentLen, "parent")}:{" "}
          {parents.map((p, i) => (
            <span key={p} data-cy="parent-commit">
              <span className={css.parentHash}>
                <CommitLink params={{ ...params, commitId: p }}>
                  {shortCommit(p)}
                </CommitLink>
              </span>
              {i !== parentLen - 1 && <span className={css.plus}>+</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function shortCommit(commitId: string): string {
  return commitId.slice(0, 7);
}
