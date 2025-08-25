import { useSetState } from "@dolthub/react-hooks";
import {
  useMergeAndResolveConflictsMutation,
  useMergePullMutation,
  usePullConflictsSummaryQuery,
} from "@gen/graphql-types";
import useMutation from "@hooks/useMutation";
import { useUserHeaders } from "@hooks/useUserHeaders";
import { gqlPullHasConflicts } from "@lib/errors/graphql";
import { errorMatches } from "@lib/errors/helpers";
import { PullDiffParams } from "@lib/params";
import { refetchMergeQueriesCacheEvict } from "@lib/refetchQueries";
import { useEffect } from "react";

export enum ConflictResolveType {
  Ours = "ours",
  Theirs = "theirs",
}

const defaultState = {
  addAuthor: false,
  showDirections: false,
  tablesToResolve: new Map<string, ConflictResolveType>(),
};

export type MergeButtonState = typeof defaultState;

export default function useMergeButton(params: PullDiffParams) {
  const userHeaders = useUserHeaders();
  const [state, setState] = useSetState({
    ...defaultState,
    addAuthor: !!(userHeaders?.email && userHeaders.user),
  });

  const variables = { ...params, toBranchName: params.refName };
  const { mutateFn: merge, ...res } = useMutation({
    hook: useMergePullMutation,
  });
  const { mutateFn: mergeWithResolve, ...resolveRes } = useMutation({
    hook: useMergeAndResolveConflictsMutation,
  });
  const conflictsRes = usePullConflictsSummaryQuery({
    variables,
  });

  const hasConflicts =
    errorMatches(gqlPullHasConflicts, res.err) ||
    errorMatches("conflicts found", res.err) ||
    !!conflictsRes.data?.pullConflictsSummary?.length;
  const disabled = hasConflicts;

  useEffect(() => {
    if (
      conflictsRes.loading ||
      !conflictsRes.data?.pullConflictsSummary ||
      state.tablesToResolve.size > 0
    ) {
      return;
    }

    const tablesToResolve = state.tablesToResolve;
    conflictsRes.data.pullConflictsSummary.forEach(conflict => {
      tablesToResolve.set(conflict.tableName, ConflictResolveType.Ours);
    });
    setState({ tablesToResolve });
  }, [
    conflictsRes.loading,
    conflictsRes.data,
    state.tablesToResolve,
    setState,
  ]);

  const onClick = async () => {
    const { success } = await merge({
      variables: {
        ...variables,
        author:
          state.addAuthor && userHeaders?.email && userHeaders.user
            ? { name: userHeaders.user, email: userHeaders.email }
            : undefined,
      },
    });

    if (!success) return;
    res.client
      .refetchQueries(refetchMergeQueriesCacheEvict)
      .catch(console.error);
  };

  const onClickWithResolve = async () => {
    const { success } = await mergeWithResolve({
      variables: {
        ...variables,
        resolveOursTables: tableResolveMapToArray(
          state.tablesToResolve,
          ConflictResolveType.Ours,
        ),
        resolveTheirsTables: tableResolveMapToArray(
          state.tablesToResolve,
          ConflictResolveType.Theirs,
        ),
        author:
          state.addAuthor && userHeaders?.email && userHeaders.user
            ? { name: userHeaders.user, email: userHeaders.email }
            : undefined,
      },
    });

    if (!success) return;
    res.client
      .refetchQueries(refetchMergeQueriesCacheEvict)
      .catch(console.error);
  };

  return {
    onClick,
    onClickWithResolve,
    disabled,
    hasConflicts,
    userHeaders,
    pullConflictsSummary: conflictsRes.data?.pullConflictsSummary,
    conflictsLoading: conflictsRes.loading,
    state,
    setState,
    mergeState: {
      loading: res.loading,
      err: res.err,
    },
    resolveState: {
      loading: resolveRes.loading,
      err: resolveRes.err,
    },
  };
}

function tableResolveMapToArray(
  resolveMap: Map<string, ConflictResolveType>,
  resolveType: ConflictResolveType,
): string[] {
  return Array.from(resolveMap)
    .filter(([, v]) => v === resolveType)
    .map(([k]) => k);
}
