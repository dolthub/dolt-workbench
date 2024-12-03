import { Button, Loader, QueryHandler } from "@dolthub/react-components";
import { RemoteFragment } from "@gen/graphql-types";
import { DatabaseParams } from "@lib/params";
import { gqlDepNotFound } from "@lib/errors/graphql";
import { errorMatches } from "@lib/errors/helpers";
import Database404 from "@components/Database404";
import InfiniteScroll from "react-infinite-scroller";
import HideForNoWritesWrapper from "@components/util/HideForNoWritesWrapper";
import Link from "@components/links/Link";
import { newRemote } from "@lib/urls";
import { useRemoteList } from "./useRemoteList";
import RemoteRow from "./RemoteRow";
import css from "./index.module.css";

type Props = {
  params: DatabaseParams;
};

type InnerProps = {
  remotes: RemoteFragment[];
  loadMore: () => Promise<void>;
  hasMore: boolean;
} & Props;

function Inner({ remotes, loadMore, hasMore, params }: InnerProps) {
  const createUrl = newRemote(params);
  return (
    <div className={css.container}>
      <div className={css.top}>
        <h1>Remotes</h1>
        <div className={css.topRight}>
          <HideForNoWritesWrapper params={params}>
            <Link {...createUrl} className={css.white}>
              <Button>Add Remote</Button>
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
                </tr>
              </thead>
              <tbody>
                {remotes.map(r => (
                  <RemoteRow key={r._id} remote={r} />
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
    </div>
  );
}

export default function RemotesPage({ params }: Props) {
  const res = useRemoteList(params);
  if (res.loading) return <Loader loaded={false} />;
  if (errorMatches(gqlDepNotFound, res.error)) {
    return <Database404 params={params} />;
  }

  return (
    <QueryHandler
      result={{ ...res, data: res.remotes }}
      render={data => (
        <Inner
          remotes={data}
          loadMore={res.loadMore}
          hasMore={res.hasMore}
          params={params}
        />
      )}
    />
  );
}
