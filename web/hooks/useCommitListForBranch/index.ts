import {
  CommitForHistoryFragment,
  HistoryForBranchDocument,
  HistoryForBranchQuery,
  HistoryForBranchQueryVariables,
  useHistoryForBranchQuery,
} from "@gen/graphql-types";
import useApolloError from "@hooks/useApolloError";
import Maybe from "@lib/Maybe";
import { handleCaughtApolloError } from "@lib/errors/helpers";
import { ApolloErrorType } from "@lib/errors/types";
import { RefParams } from "@lib/params";
import { useEffect, useState } from "react";

type ReturnType = {
  loading: boolean;
  error?: ApolloErrorType;
  commits: CommitForHistoryFragment[] | undefined;
  hasMore: boolean;
  loadMore: () => Promise<void>;
};

export function useCommitListForBranch(
  params: RefParams,
  reload?: boolean,
): ReturnType {
  const { data, client, ...res } = useHistoryForBranchQuery({
    variables: params,
    fetchPolicy: "cache-and-network",
  });

  const [err, setErr] = useApolloError(res.error);
  const [commits, setCommits] = useState(data?.commits.list);
  const [offset, setOffset] = useState(data?.commits.nextOffset);
  const [lastOffset, setLastOffset] = useState<Maybe<number>>(undefined);
  const [dataInitiallyLoaded, setDataInitiallyLoaded] = useState(false);

  useEffect(() => {
    if (!data || (dataInitiallyLoaded && !reload)) return;
    setCommits(data.commits.list);
    setOffset(data.commits.nextOffset);
    setDataInitiallyLoaded(true);
  }, [data, dataInitiallyLoaded, reload, setCommits, setOffset]);

  const loadMore = async () => {
    if (!offset) {
      return;
    }
    setLastOffset(offset);
    try {
      const result = await client.query<
        HistoryForBranchQuery,
        HistoryForBranchQueryVariables
      >({
        query: HistoryForBranchDocument,
        variables: { ...params, offset },
      });
      const newCommits = result.data.commits.list;
      const newOffset = result.data.commits.nextOffset;
      setCommits((commits ?? []).concat(newCommits));
      setOffset(newOffset);
    } catch (e) {
      handleCaughtApolloError(e, setErr);
    }
  };

  const hasMore =
    offset !== undefined && offset !== null && offset !== lastOffset;

  return { ...res, error: err, commits, loadMore, hasMore };
}
