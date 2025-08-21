import { useSetState } from "@dolthub/react-hooks";
import {
  ConflictResolveType,
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

export default function useMergeButton(params: PullDiffParams) {
  const userHeaders = useUserHeaders();
  const [state, setState] = useSetState({
    addAuthor: !!(userHeaders?.email && userHeaders.user),
    showDirections: false,
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

  const onClickWithResolve = async (resolveType: ConflictResolveType) => {
    const { success } = await mergeWithResolve({
      variables: {
        ...variables,
        conflictResolveType: resolveType,
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
