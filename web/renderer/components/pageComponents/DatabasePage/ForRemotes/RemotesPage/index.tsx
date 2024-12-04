import { Loader, QueryHandler } from "@dolthub/react-components";

import { DatabaseParams } from "@lib/params";
import { gqlDepNotFound } from "@lib/errors/graphql";
import { errorMatches } from "@lib/errors/helpers";
import Database404 from "@components/Database404";

import { useRemoteList } from "./useRemoteList";
import Inner from "./Inner";

type Props = {
  params: DatabaseParams;
};

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
