import { useSetState } from "@dolthub/react-hooks";
import { Maybe } from "@dolthub/web-utils";
import {
  RowForDoltLookupFragment,
  SqlSelectForDoltLookupFragment,
} from "@gen/graphql-types";
import useApolloError from "@hooks/useApolloError";
import { handleCaughtApolloError } from "@lib/errors/helpers";
import { ApolloErrorType } from "@lib/errors/types";
import { useEffect } from "react";

type ReturnType = {
  rows?: RowForDoltLookupFragment[];
  loadMore: () => Promise<void>;
  hasMore: boolean;
  err: ApolloErrorType;
};

export default function useDoltLookupRows(
  data: SqlSelectForDoltLookupFragment | undefined,
  fetchPage: (offset: number) => Promise<SqlSelectForDoltLookupFragment>,
): ReturnType {
  const [state, setState] = useSetState({
    rows: [] as RowForDoltLookupFragment[],
    nextOffset: undefined as Maybe<number>,
    lastOffset: undefined as Maybe<number>,
  });
  const [err, setErr] = useApolloError(undefined);

  useEffect(() => {
    setState({
      rows: [],
      nextOffset: data?.rows.nextOffset,
      lastOffset: undefined,
    });
  }, [data, setState]);

  const loadMore = async () => {
    if (state.nextOffset === undefined || state.nextOffset === null) {
      return;
    }
    setState({ lastOffset: state.nextOffset });
    try {
      const page = await fetchPage(state.nextOffset);
      setState({
        rows: state.rows.concat(page.rows.list),
        nextOffset: page.rows.nextOffset,
      });
    } catch (e) {
      handleCaughtApolloError(e, setErr);
    }
  };

  const hasMore =
    state.nextOffset !== undefined &&
    state.nextOffset !== null &&
    state.nextOffset !== state.lastOffset;

  return {
    rows: data ? data.rows.list.concat(state.rows) : undefined,
    loadMore,
    hasMore,
    err,
  };
}
