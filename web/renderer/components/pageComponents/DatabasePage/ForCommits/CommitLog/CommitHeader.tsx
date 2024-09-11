import { areTimeAgosEqual } from "@dolthub/web-utils";
import { CommitForHistoryFragment } from "@gen/graphql-types";
import ReactTimeago from "react-timeago";
import css from "./index.module.css";

type Props = {
  commit: CommitForHistoryFragment; // current commit
  lastCommit?: CommitForHistoryFragment; // commit that comes before current commit
};

export default function CommitHeader(props: Props) {
  // Should show header if `commit` is the first commit in the list (i.e. there is no
  // `lastCommit`) or if the timeago of `commit` does not match the timeago of `lastCommit`
  const shouldShowHeader =
    !props.lastCommit ||
    !areTimeAgosEqual(props.commit.committedAt, props.lastCommit.committedAt);

  if (!shouldShowHeader) return null;

  return (
    <li className={css.header}>
      <span className={css.bullet} />
      Commits from <ReactTimeago date={props.commit.committedAt} />
    </li>
  );
}
