import CommitLink from "@components/links/CommitLink";
import RefLink from "@components/links/RefLink";
import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { Button } from "@dolthub/react-components";
import { TagForListFragment } from "@gen/graphql-types";
import { DatabaseParams } from "@lib/params";
import { FaRegTrashAlt } from "@react-icons/all-files/fa/FaRegTrashAlt";
import { IoIosGitCommit } from "@react-icons/all-files/io/IoIosGitCommit";
import Timeago from "react-timeago";
import css from "./index.module.css";

type Props = {
  tag: TagForListFragment;
  latest: boolean;
  params: DatabaseParams;
  onDeleteClicked: () => void;
};

export default function ReleaseListItem({
  tag,
  onDeleteClicked,
  ...props
}: Props): JSX.Element {
  const { username, displayName } = tag.tagger;

  return (
    <li className={css.item} data-cy="release-list-item">
      <div className={css.itemTop}>
        <span className={css.releaseName} data-cy="release-item-release-name">
          <RefLink params={{ ...props.params, refName: tag.tagName }}>
            <span>{tag.tagName}</span>
          </RefLink>
          {props.latest && (
            <div className={css.latest} data-cy="release-list-latest-label">
              Latest release
            </div>
          )}
        </span>
        <HideForNoWritesWrapper params={props.params}>
          <Button.Link
            onClick={onDeleteClicked}
            red
            className={css.delete}
            aria-label="delete"
          >
            <FaRegTrashAlt />
          </Button.Link>
        </HideForNoWritesWrapper>
      </div>
      {tag.message && (
        <span className={css.releaseNotes}>
          <p>{tag.message}</p>
        </span>
      )}
      <div className={css.itemBottom}>
        <span>
          <span className={css.bold}>{username ?? displayName}</span> tagged{" "}
          <span className={css.timeago} data-cy="release-list-item-date">
            <Timeago date={tag.taggedAt} />
          </span>
        </span>
        <CommitLink
          params={{
            ...props.params,
            refName: tag.tagName,
            commitId: tag.commitId,
          }}
          className={css.commitId}
        >
          <IoIosGitCommit className={css.commitIcon} />
          {tag.commitId}
        </CommitLink>
      </div>
    </li>
  );
}
