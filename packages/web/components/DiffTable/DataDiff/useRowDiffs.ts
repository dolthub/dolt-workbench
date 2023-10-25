import {
  DiffRowType,
  RowDiffForTableListFragment,
  RowDiffsDocument,
  RowDiffsQuery,
  RowDiffsQueryVariables,
  useRowDiffsQuery,
} from "@gen/graphql-types";
import useApolloError from "@hooks/useApolloError";
import useSetState from "@hooks/useSetState";
import Maybe from "@lib/Maybe";
import { handleCaughtApolloError } from "@lib/errors/helpers";
import { ApolloErrorType } from "@lib/errors/types";
import { RequiredCommitsParams } from "@lib/params";
import { useEffect, useState } from "react";
import { RowDiffState, getDefaultState } from "./state";

type ReturnType = {
  fetchMore: () => Promise<void>;
  setFilter: (d: DiffRowType | undefined) => void;
  state: RowDiffState;
  hasMore: boolean;
  loading: boolean;
  error?: ApolloErrorType;
};

type Params = RequiredCommitsParams & {
  tableName: string;
};

export default function useRowDiffs(params: Params): ReturnType {
  const { data, client, loading, error } = useRowDiffsQuery({
    variables: params,
  });
  const [state, setState] = useSetState(getDefaultState(data?.rowDiffs));
  const [lastOffset, setLastOffset] = useState<Maybe<number>>(undefined);
  const [err, setErr] = useApolloError(error);

  useEffect(() => {
    if (loading || error || !data) return;
    setState(getDefaultState(data.rowDiffs));
  }, [loading, error, data, setState]);

  const handleQuery = async (
    setRowDiffs: (rd: RowDiffForTableListFragment[]) => void,
    offset: Maybe<number>,
    filterByRowType?: DiffRowType,
  ) => {
    if (err) setErr(undefined);
    if (offset === undefined || offset === null) {
      return;
    }
    setLastOffset(offset);
    try {
      const res = await client.query<RowDiffsQuery, RowDiffsQueryVariables>({
        query: RowDiffsDocument,
        variables: { ...params, offset, filterByRowType },
      });
      setRowDiffs(res.data.rowDiffs.list);
      setState({ offset: res.data.rowDiffs.nextOffset });
    } catch (er) {
      handleCaughtApolloError(er, setErr);
    }
  };

  const fetchMore = async () => {
    const setRowDiffs = (rd: RowDiffForTableListFragment[]) =>
      setState({ rowDiffs: state.rowDiffs.concat(rd) });
    await handleQuery(setRowDiffs, state.offset, state.filter);
  };

  // Changes diff row filter, starts with first page diffs
  const setFilter = async (rowType?: DiffRowType) => {
    setState({ filter: rowType });
    const setRowDiffs = (rd: RowDiffForTableListFragment[]) =>
      setState({ rowDiffs: rd });
    await handleQuery(setRowDiffs, 0, rowType ?? DiffRowType.All);
  };

  const hasMore =
    state.offset !== undefined &&
    state.offset !== null &&
    state.offset !== lastOffset;

  return { state, fetchMore, setFilter, hasMore, loading, error: err };
}
