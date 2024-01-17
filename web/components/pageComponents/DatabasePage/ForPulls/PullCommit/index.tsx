import Link from "@components/links/Link";
import { getLongDateTimeString } from "@dolthub/web-utils";
import { PullDetailCommitFragment } from "@gen/graphql-types";
import { PullDiffParams } from "@lib/params";
import { diff } from "@lib/urls";
import { IoGitCommitOutline } from "@react-icons/all-files/io5/IoGitCommitOutline";
import cx from "classnames";
import css from "./index.module.css";

type Props = {
  commit: PullDetailCommitFragment;
  params: PullDiffParams;
};

export default function PullCommit({ commit, params }: Props) {
  const commitLink = diff({
    ...params,
    refName: params.fromBranchName,
    fromCommitId: commit.parentCommitId || "",
    toCommitId: commit.commitId,
  });
  const date = new Date(commit.createdAt);

  return (
    <li className={css.commit}>
      <span className={css.bull}>
        <IoGitCommitOutline />
        <Link {...commitLink} className={css.hash}>
          {commit.commitId.substring(0, 7)}
        </Link>
      </span>
      <div className={css.left}>
        <div className={css.mobileVerticalLine} />
        <span className={css.desktopBull}>
          <IoGitCommitOutline />
          <div className={css.verticalLine} />
        </span>
        <div>
          <Link {...commitLink} className={css.message}>
            {commit.message}
          </Link>
          <span className={css.date}>{getLongDateTimeString(date)}</span>
        </div>
      </div>
      <Link {...commitLink} className={cx(css.hash, css.desktop)}>
        {commit.commitId.substring(0, 7)}
      </Link>
    </li>
  );
}
