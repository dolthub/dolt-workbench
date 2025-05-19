import { Button } from "@dolthub/react-components";
import { RemoteFragment, useDeleteRemoteMutation } from "@gen/graphql-types";
import InfiniteScroll from "react-infinite-scroller";
import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import Link from "@components/links/Link";
import { newRemote } from "@lib/urls";
import { useState } from "react";
import DeleteModal from "@components/DeleteModal";
import { refetchRemoteQueries } from "@lib/refetchQueries";
import { OptionalRefParams } from "@lib/params";
import RemoteRow from "./RemoteRow";
import css from "./index.module.css";
import DoltLoginButton from "./DoltLoginButton";

type InnerProps = {
  params: OptionalRefParams;
  remotes: RemoteFragment[];
  loadMore: () => Promise<void>;
  hasMore: boolean;
};

export default function Inner({
  remotes,
  loadMore,
  hasMore,
  params,
}: InnerProps) {
  const createUrl = newRemote(params);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [remoteNameToDelete, setRemoteNameToDelete] = useState("");
  const onDeleteClicked = (r: RemoteFragment) => {
    setRemoteNameToDelete(r.name);
    setDeleteModalOpen(true);
  };

  return (
    <div className={css.container}>
      <div className={css.top}>
        <h1>Remotes</h1>
        <div className={css.topRight}>
          <DoltLoginButton />
          <HideForNoWritesWrapper params={params}>
            <Link {...createUrl} className={css.white}>
              <Button data-cy="add-remote-button">Add Remote</Button>
            </Link>
          </HideForNoWritesWrapper>
        </div>
      </div>
      {remotes.length ? (
        <div className={css.tableParent}>
          <InfiniteScroll
            loadMore={loadMore}
            hasMore={hasMore}
            loader={<div className={css.loader}>Loading remotes ...</div>}
            useWindow={false}
            initialLoad={false}
            getScrollParent={() => document.getElementById("main-content")}
          >
            <table className={css.table} data-cy="remote-list">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Url</th>
                  <th>Fetch Specs</th>
                  <th aria-hidden="true" />
                </tr>
              </thead>
              <tbody>
                {remotes.map(r => (
                  <RemoteRow
                    key={r._id}
                    remote={r}
                    onDeleteClicked={() => onDeleteClicked(r)}
                    params={params}
                  />
                ))}
              </tbody>
            </table>
          </InfiniteScroll>
        </div>
      ) : (
        <p className={css.noRemotes} data-cy="remote-list-no-remotes">
          No remotes found
        </p>
      )}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        setIsOpen={setDeleteModalOpen}
        asset="remote"
        assetId={remoteNameToDelete}
        mutationProps={{
          hook: useDeleteRemoteMutation,
          variables: { ...params, remoteName: remoteNameToDelete },
          refetchQueries: refetchRemoteQueries(params),
        }}
        cannotBeUndone
      />
    </div>
  );
}
