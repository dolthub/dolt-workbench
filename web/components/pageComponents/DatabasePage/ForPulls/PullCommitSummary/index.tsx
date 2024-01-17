import { pluralize } from "@dolthub/web-utils";
import { PullDetailSummaryFragment } from "@gen/graphql-types";
import { RiGitRepositoryCommitsFill } from "@react-icons/all-files/ri/RiGitRepositoryCommitsFill";
import TimeAgo from "react-timeago";
import css from "./index.module.css";

type Props = {
  summary: PullDetailSummaryFragment;
};

export default function PullCommitSummary({ summary }: Props) {
  return (
    <li className={css.summary}>
      <span className={css.icon}>
        <RiGitRepositoryCommitsFill />
      </span>
      <div className={css.mobileVerticalLine} />
      <div className={css.right}>
        <span className={css.user}>{summary.username}</span> added{" "}
        {summary.numCommits} {pluralize(summary.numCommits, "commit")}{" "}
        <TimeAgo date={summary.createdAt} />
      </div>
    </li>
  );
}
