import { Maybe } from "@dolthub/web-utils";
import {
  BranchListForCommitGraphDocument,
  BranchListForCommitGraphQuery,
  BranchListForCommitGraphQueryVariables,
  CommitForHistoryFragment,
  HistoryForBranchDocument,
  HistoryForBranchQuery,
  HistoryForBranchQueryVariables,
  useBranchListForCommitGraphQuery,
  useHistoryForBranchQuery,
} from "@gen/graphql-types";
import { handleCaughtApolloError } from "@lib/errors/helpers";
import { ApolloErrorType } from "@lib/errors/types";
import { RefParams } from "@lib/params";
import { ref } from "@lib/urls";
import { useEffect, useState } from "react";
import useApolloError from "../useApolloError";

export type CommitWithHead = CommitForHistoryFragment & {
  refs: string[];
};

export type BranchHeads = {
  name: string;
  commit: {
    sha: string;
  };
  link: string;
};

type ReturnType = {
  loading: boolean;
  error?: ApolloErrorType;
  commits: CommitForHistoryFragment[] | undefined;
  hasMore: boolean;
  branchHeads: BranchHeads[];
  loadMore: () => Promise<void>;
};

export function useCommitListForCommitGraph(
  params: RefParams,
  reload?: boolean,
): ReturnType {
  const { data, client, ...res } = useHistoryForBranchQuery({
    variables: params,
    fetchPolicy: "cache-and-network",
  });

  const { data: branchesData, ...branchesRes } =
    useBranchListForCommitGraphQuery({
      variables: params,
      fetchPolicy: "cache-and-network",
    });

  const [err, setErr] = useApolloError(res.error || branchesRes.error);

  const [commits, setCommits] = useState(data?.commits.list);
  const [commitsOffset, setCommitsOffset] = useState(data?.commits.nextOffset);
  const [lastOffset, setLastOffset] = useState<Maybe<number>>(undefined);
  const [dataInitiallyLoaded, setDataInitiallyLoaded] = useState(false);

  const [branches, setBranches] = useState(branchesData?.branches.list);
  const [branchesOffset, setBranchesOffset] = useState(
    branchesData?.branches.nextOffset,
  );

  useEffect(() => {
    if (!data || !branchesData || (dataInitiallyLoaded && !reload)) return;
    setCommits(data.commits.list);
    setCommitsOffset(data.commits.nextOffset);
    setBranches(branchesData.branches.list);
    setBranchesOffset(branchesData.branches.nextOffset);
    setDataInitiallyLoaded(true);
  }, [
    data,
    dataInitiallyLoaded,
    reload,
    setCommits,
    setCommitsOffset,
    params,
    branchesData,
    setBranches,
    setBranchesOffset,
  ]);

  const loadMore = async () => {
    if (!commitsOffset) {
      return;
    }
    if (commitsOffset) {
      setLastOffset(commitsOffset);
      try {
        const result = await client.query<
          HistoryForBranchQuery,
          HistoryForBranchQueryVariables
        >({
          query: HistoryForBranchDocument,
          variables: { ...params, offset: commitsOffset },
        });
        const newCommits = result.data.commits.list;
        const newOffset = result.data.commits.nextOffset;
        const allCommits = (commits ?? []).concat(newCommits);
        setCommits(allCommits);
        setCommitsOffset(newOffset);
      } catch (e) {
        handleCaughtApolloError(e, setErr);
      }
    }
    if (branchesOffset) {
      try {
        const result = await branchesRes.client.query<
          BranchListForCommitGraphQuery,
          BranchListForCommitGraphQueryVariables
        >({
          query: BranchListForCommitGraphDocument,
          variables: { ...params, offset: branchesOffset },
        });
        const newBranches = result.data.branches.list;
        const newToken = result.data.branches.nextOffset;
        const allBranches = (branches ?? []).concat(newBranches);
        setBranches(allBranches);
        setBranchesOffset(newToken);
      } catch (e) {
        handleCaughtApolloError(e, setErr);
      }
    }
  };

  const branchHeads =
    branches?.map(b => {
      return {
        name: b.branchName,
        commit: { sha: b.head || "" },
        link: ref({ ...params, refName: b.branchName }).asPathname(),
      };
    }) || [];

  const hasMore =
    commitsOffset !== undefined &&
    commitsOffset !== null &&
    commitsOffset !== lastOffset;

  return {
    loading: res.loading || branchesRes.loading,
    error: err,
    commits,
    branchHeads,
    loadMore,
    hasMore,
  };
}
