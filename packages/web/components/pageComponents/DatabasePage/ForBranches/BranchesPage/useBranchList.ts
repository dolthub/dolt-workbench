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
  }, [data, setBranches]);

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
      setBranches(newBranches);
    } catch (e) {
      handleCaughtApolloError(e, setErr);
    }
  };

  return {
    ...res,
    error: err,
    branches,
    refetch,
    sortBranches,
    sortBy,
  };
}
