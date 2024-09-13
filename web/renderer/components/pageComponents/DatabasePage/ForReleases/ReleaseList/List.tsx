import { TagForListFragment } from "@gen/graphql-types";
import { OptionalRefParams } from "@lib/params";
import { Fragment } from "react";
import InfiniteScroll from "react-infinite-scroller";
import ReleaseHeader from "./ReleaseHeader";
import ReleaseListItem from "./ReleaseListItem";
import css from "./index.module.css";

type InnerProps = {
  tags?: TagForListFragment[];
  loadMore: () => void;
  hasMore: boolean;
  params: OptionalRefParams;
  openDeleteModal: (t: TagForListFragment) => void;
};

export default function List({ tags = [], ...props }: InnerProps) {
  return (
    <div className={css.tagContainer}>
      <InfiniteScroll
        loadMore={props.loadMore}
        hasMore={props.hasMore}
        loader={
          <p className={css.loading} key={0}>
            Loading releases...
          </p>
        }
        useWindow={false}
        initialLoad={false}
        getScrollParent={() => document.getElementById("main-content")}
      >
        <ol className={css.list} data-cy="release-list-releases-list">
          {tags.map((t, i) => {
            const latestRelease = tags[i - 1];
            return (
              <Fragment key={`frag-${t._id}`}>
                <ReleaseHeader
                  key={`header-${t._id}`}
                  tag={t}
                  prevTag={latestRelease}
                />
                <ReleaseListItem
                  {...props}
                  key={t._id}
                  tag={t}
                  latest={i === 0}
                  onDeleteClicked={() => props.openDeleteModal(t)}
                />
              </Fragment>
            );
          })}
        </ol>
      </InfiniteScroll>
    </div>
  );
}
