import { Database404Inner } from "@components/Database404";
import DeleteModal from "@components/DeleteModal";
import Page404 from "@components/Page404";
import Link from "@components/links/Link";
import { BsArrowLeft } from "@react-icons/all-files/bs/BsArrowLeft";
import { FaChevronRight } from "@react-icons/all-files/fa/FaChevronRight";
import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { Button, Loader } from "@dolthub/react-components";
import { TagForListFragment, useDeleteTagMutation } from "@gen/graphql-types";
import { gqlDepNotFound } from "@lib/errors/graphql";
import { errorMatches } from "@lib/errors/helpers";
import { OptionalRefParams } from "@lib/params";
import { refetchTagQueries } from "@lib/refetchQueries";
import { diff, newRelease } from "@lib/urls";
import { useState } from "react";
import List from "./List";
import { useTagList } from "./useTagList";
import TagSelector from "./TagSelector";
import css from "./index.module.css";

type Props = {
  params: OptionalRefParams;
};

type InnerProps = {
  tags?: TagForListFragment[];
  loadMore: () => void;
  hasMore: boolean;
} & Props;

function Inner({ tags, ...props }: InnerProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tagNameToDelete, setTagNameToDelete] = useState("");
  const [fromTag, setFromTag] = useState("");
  const [toTag, setToTag] = useState("");

  const openDeleteModal = (t: TagForListFragment) => {
    setTagNameToDelete(t.tagName);
    setDeleteModalOpen(true);
  };

  return (
    <div className={css.container}>
      <div className={css.top}>
        <h1>Releases</h1>
        <HideForNoWritesWrapper params={props.params}>
          <Link
            {...newRelease({
              ...props.params,
              refName:
                tagNameToDelete === props.params.refName
                  ? undefined
                  : props.params.refName,
            })}
          >
            <Button>Create Release</Button>
          </Link>
        </HideForNoWritesWrapper>
      </div>
      {tags?.length ? (
        <div>
          <div className={css.outer}>
            <form>
              <div className={css.selectors}>
                <TagSelector
                  tags={tags}
                  val={toTag}
                  label="to tag"
                  onChange={setToTag}
                />
                <div className={css.arrow}>
                  <BsArrowLeft />
                </div>

                <TagSelector
                  tags={tags}
                  val={fromTag}
                  label="from tag"
                  onChange={setFromTag}
                />
              </div>
            </form>
            {fromTag && toTag && fromTag !== toTag && (
              <Link
                {...diff({
                  ...props.params,
                  refName: props.params.refName || "",
                  fromCommitId:
                    tags.filter(t => t.tagName === fromTag)[0].commitId || "",
                  toCommitId:
                    tags.filter(t => t.tagName === toTag)[0].commitId || "",
                })}
                className={css.viewDiffButton}
              >
                <Button>
                  View Diff <FaChevronRight />
                </Button>
              </Link>
            )}
          </div>
          <List {...props} tags={tags} openDeleteModal={openDeleteModal} />
        </div>
      ) : (
        <p className={css.noReleases} data-cy="release-list-no-releases">
          No releases found
        </p>
      )}
      <DeleteModal
        isOpen={deleteModalOpen}
        setIsOpen={setDeleteModalOpen}
        asset="release"
        assetId={tagNameToDelete}
        mutationProps={{
          hook: useDeleteTagMutation,
          variables: { ...props.params, tagName: tagNameToDelete },
          refetchQueries: refetchTagQueries(props.params),
        }}
        cannotBeUndone
      />
    </div>
  );
}

export default function ReleaseList(props: Props): JSX.Element {
  const { loading, tags, loadMore, hasMore, error } = useTagList(props.params);

  if (loading) return <Loader loaded={false} />;

  if (error) {
    if (errorMatches(gqlDepNotFound, error)) {
      return <Database404Inner {...props} />;
    }
    const title = `Releases for ${props.params.databaseName} not found`;
    return <Page404 title={title} error={error} />;
  }

  return <Inner {...props} tags={tags} loadMore={loadMore} hasMore={hasMore} />;
}
