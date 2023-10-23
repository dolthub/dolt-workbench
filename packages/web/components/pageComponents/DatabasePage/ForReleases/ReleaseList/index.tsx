import Button from "@components/Button";
import { Database404Inner } from "@components/Database404";
import DeleteModal from "@components/DeleteModal";
import Loader from "@components/Loader";
import Page404 from "@components/Page404";
import Link from "@components/links/Link";
import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import { TagForListFragment, useDeleteTagMutation } from "@gen/graphql-types";
import { gqlDepNotFound } from "@lib/errors/graphql";
import { errorMatches } from "@lib/errors/helpers";
import { OptionalRefParams } from "@lib/params";
import { refetchTagQueries } from "@lib/refetchQueries";
import { newRelease } from "@lib/urls";
import { useState } from "react";
import List from "./List";
import css from "./index.module.css";
import { useTagList } from "./useTagList";

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
        <List {...props} tags={tags} openDeleteModal={openDeleteModal} />
      ) : (
        <p className={css.noReleases} data-cy="release-list-no-releases">
          No releases found
        </p>
      )}
      <DeleteModal
        isOpen={deleteModalOpen}
        setIsOpen={setDeleteModalOpen}
        title="Delete Release"
        btnText="Delete release"
        mutationProps={{
          hook: useDeleteTagMutation,
          variables: { ...props.params, tagName: tagNameToDelete },
          refetchQueries: refetchTagQueries(props.params),
        }}
      >
        <p>
          Are you sure you want to delete the{" "}
          <span className={css.releaseToDelete}>{tagNameToDelete}</span>{" "}
          release?
          <br />
          This cannot be undone.
        </p>
      </DeleteModal>
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
