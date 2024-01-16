import { Maybe } from "@dolthub/web-utils";
import {
  BranchFragment,
  BranchListDocument,
  BranchListQuery,
  BranchListQueryVariables,
  SortBranchesBy,
  useBranchListQuery,
} from "@gen/graphql-types";
import useApolloError from "@hooks/useApolloError";
import { handleCaughtApolloError } from "@lib/errors/helpers";
import { ApolloErrorType } from "@lib/errors/types";
import { DatabaseParams } from "@lib/params";
import { useEffect, useState } from "react";

type ReturnType = {
  branches?: BranchFragment[];
  loadMore: () => Promise<void>;
  hasMore: boolean;
  loading: boolean;
  error?: ApolloErrorType;
  refetch: () => Promise<void>;
  sortBranches: (sortBy?: SortBranchesBy) => Promise<void>;
  sortBy?: SortBranchesBy;
};

export function useBranchList(params: DatabaseParams): ReturnType {
  const { data, ...res } = useBranchListQuery({
    variables: params,
    fetchPolicy: "cache-and-network",
  });
  const [branches, setBranches] = useState(data?.branches.list);
  const [sortBy, setSortBy] = useState<SortBranchesBy | undefined>(undefined);
  const [offset, setOffset] = useState(data?.branches.nextOffset);
  const [lastOffset, setLastOffset] = useState<Maybe<number>>(undefined);
  const [err, setErr] = useApolloError(res.error);

  const refetch = async () => {
    try {
      const newRes = await res.refetch(params);
      setBranches(newRes.data.branches.list);
    } catch (e) {
      handleCaughtApolloError(e, setErr);
    }
  };

  useEffect(() => {
    setBranches(data?.branches.list);
    setOffset(data?.branches.nextOffset);
  }, [data, setBranches, setOffset]);

  const loadMore = async () => {
    if (!offset) {
      return;
    }
    setLastOffset(offset);
    try {
      const result = await res.client.query<
        BranchListQuery,
        BranchListQueryVariables
      >({
        query: BranchListDocument,
        variables: { ...params, offset, sortBy },
      });
      const newBranches = result.data.branches.list;
      const newOffset = result.data.branches.nextOffset;
      setBranches((branches ?? []).concat(newBranches));
      setOffset(newOffset);
    } catch (e) {
      handleCaughtApolloError(e, setErr);
    }
  };

  const sortBranches = async (sb?: SortBranchesBy) => {
    setSortBy(sb);
    try {
      const result = await res.client.query<
        BranchListQuery,
        BranchListQueryVariables
      >({
        query: BranchListDocument,
        variables: { ...params, sortBy: sb },
      });
      const newBranches = result.data.branches.list;
      const newOffset = result.data.branches.nextOffset;
      setBranches(newBranches);
      setOffset(newOffset);
      setLastOffset(undefined);
    } catch (e) {
      handleCaughtApolloError(e, setErr);
    }
  };

  const hasMore =
    offset !== undefined && offset !== null && offset !== lastOffset;

  return {
    ...res,
    error: err,
    branches,
    refetch,
    sortBranches,
    sortBy,
    loadMore,
    hasMore,
  };
}
