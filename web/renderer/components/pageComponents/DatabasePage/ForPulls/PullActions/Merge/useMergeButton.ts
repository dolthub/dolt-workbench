import { useSetState } from "@dolthub/react-hooks";
import {
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
  const conflictsRes = usePullConflictsSummaryQuery({
    variables,
  });

  const hasConflicts =
    errorMatches(gqlPullHasConflicts, res.err) ||
    errorMatches("conflicts found", res.err) ||
    !!conflictsRes.data?.pullConflictsSummary?.length;
  const disabled = hasConflicts;

  const onClick = async () => {
    await merge({
      variables: {
        ...variables,
        author:
          state.addAuthor && userHeaders?.email && userHeaders.user
            ? { name: userHeaders.user, email: userHeaders.email }
            : undefined,
      },
    });

    res.client
      .refetchQueries(refetchMergeQueriesCacheEvict)
      .catch(console.error);
  };

  return {
    onClick,
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
  };
}
