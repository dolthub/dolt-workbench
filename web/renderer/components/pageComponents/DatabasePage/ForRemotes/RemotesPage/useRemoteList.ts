import { Maybe } from "@dolthub/web-utils";
import {
  RemoteFragment,
  RemoteListDocument,
  RemoteListQuery,
  RemoteListQueryVariables,
  useRemoteListQuery,
} from "@gen/graphql-types";
import useApolloError from "@hooks/useApolloError";
import { handleCaughtApolloError } from "@lib/errors/helpers";
import { ApolloErrorType } from "@lib/errors/types";
import { DatabaseParams } from "@lib/params";
import { useEffect, useState } from "react";

type ReturnType = {
  remotes: RemoteFragment[] | undefined;
  loadMore: () => Promise<void>;
  error?: ApolloErrorType;
  loading: boolean;
  hasMore: boolean;
};

export function useRemoteList(params: DatabaseParams): ReturnType {
  const { data, ...res } = useRemoteListQuery({
    variables: params,
    fetchPolicy: "cache-and-network",
  });
  const [err, setErr] = useApolloError(res.error);
  const [remotes, setRemotes] = useState(data?.remotes.list);
  const [offset, setOffset] = useState(data?.remotes.nextOffset);
  const [lastOffset, setLastOffset] = useState<Maybe<number>>(undefined);

  useEffect(() => {
    setRemotes(data?.remotes.list);
    setOffset(data?.remotes.nextOffset);
  }, [data, setRemotes]);

  const loadMore = async () => {
    if (!offset) {
      return;
    }
    setLastOffset(offset);
    try {
      const result = await res.client.query<
        RemoteListQuery,
        RemoteListQueryVariables
      >({
        query: RemoteListDocument,
        variables: { ...params, offset },
      });
      const newRemotes = result.data.remotes.list;
      const newOffset = result.data.remotes.nextOffset;
      setRemotes((remotes ?? []).concat(newRemotes));
      setOffset(newOffset);
    } catch (e) {
      handleCaughtApolloError(e, setErr);
    }
  };

  const hasMore =
    offset !== undefined && offset !== null && offset !== lastOffset;

  return { ...res, error: err, remotes, loadMore, hasMore };
}
