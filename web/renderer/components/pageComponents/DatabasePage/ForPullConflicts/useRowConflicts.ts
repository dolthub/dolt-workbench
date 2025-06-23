import { useSetState } from "@dolthub/react-hooks";
import { Maybe } from "@dolthub/web-utils";
import {
  PullRowConflictsDocument,
  PullRowConflictsQuery,
  PullRowConflictsQueryVariables,
  usePullRowConflictsQuery,
} from "@gen/graphql-types";
import useApolloError from "@hooks/useApolloError";
import { handleCaughtApolloError } from "@lib/errors/helpers";
import { ApolloErrorType } from "@lib/errors/types";
import { PullDiffParams } from "@lib/params";
import { useEffect, useState } from "react";
import { RowConflictState, getDefaultState } from "./state";

type ReturnType = {
  fetchMore: () => Promise<void>;
  state: RowConflictState;
  hasMore: boolean;
  loading: boolean;
  error?: ApolloErrorType;
};

export default function useRowConflicts(
  _params: PullDiffParams & { tableName: string },
): ReturnType {
  const params = { ..._params, toBranchName: _params.refName };
  const { data, client, loading, error } = usePullRowConflictsQuery({
    variables: params,
  });
  const [state, setState] = useSetState(
    getDefaultState(data?.pullRowConflicts),
  );
  const [lastOffset, setLastOffset] = useState<Maybe<number>>(undefined);
  const [err, setErr] = useApolloError(error);

  useEffect(() => {
    if (loading || error || !data) return;
    setState(getDefaultState(data.pullRowConflicts));
  }, [loading, error, data, setState]);

  const fetchMore = async () => {
    if (err) setErr(undefined);
    if (state.offset === undefined || state.offset === null) {
      return;
    }
    setLastOffset(state.offset);
    try {
      const res = await client.query<
        PullRowConflictsQuery,
        PullRowConflictsQueryVariables
      >({
        query: PullRowConflictsDocument,
        variables: { ...params, offset: state.offset },
      });
      setState({
        rowConflicts: state.rowConflicts.concat(res.data.pullRowConflicts.list),
        offset: res.data.pullRowConflicts.nextOffset,
      });
    } catch (er) {
      handleCaughtApolloError(er, setErr);
    }
  };
  const hasMore =
    state.offset !== undefined &&
    state.offset !== null &&
    state.offset !== lastOffset;

  return { state, fetchMore, hasMore, loading, error: err };
}
