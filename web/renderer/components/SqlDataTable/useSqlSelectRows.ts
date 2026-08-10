import { ApolloClient } from "@apollo/client";
import { useSetState } from "@dolthub/react-hooks";
import { Maybe } from "@dolthub/web-utils";
import {
  ColumnForSqlDataTableFragment,
  QueryExecutionStatus,
  RowForDataTableFragment,
  SqlSelectForSqlDataTableDocument,
  SqlSelectForSqlDataTableQuery,
  SqlSelectForSqlDataTableQueryVariables,
  useSqlSelectForSqlDataTableQuery,
} from "@gen/graphql-types";
import useApolloError from "@hooks/useApolloError";
import { handleCaughtApolloError } from "@lib/errors/helpers";
import { ApolloErrorType } from "@lib/errors/types";
import { SqlQueryParams } from "@lib/params";
import {
  PendingSqlResult,
  clearPendingSqlResult,
  peekPendingSqlResult,
  pendingSqlResultMatches,
  subscribePendingSqlResult,
} from "@lib/pendingSqlResult";
import { useEffect, useReducer, useState } from "react";

export const defaultState = {
  offset: undefined as Maybe<number>,
  rows: [] as RowForDataTableFragment[],
  cols: [] as ColumnForSqlDataTableFragment[],
  warnings: [] as string[],
  executionStatus: undefined as unknown as QueryExecutionStatus,
  executionMessage: "",
  isMutation: false,
};
export type RowsState = typeof defaultState;

function getDefaultState(data?: SqlSelectForSqlDataTableQuery): RowsState {
  return {
    ...defaultState,
    rows: data?.sqlSelect.rows.list ?? [],
    cols: data?.sqlSelect.columns || [],
    offset: data?.sqlSelect.rows.nextOffset,
    warnings: data?.sqlSelect.warnings ?? [],
    executionStatus:
      data?.sqlSelect.queryExecutionStatus ||
      (undefined as unknown as QueryExecutionStatus),
    executionMessage: data?.sqlSelect.queryExecutionMessage || "",
    isMutation: data?.sqlSelect.isMutation ?? false,
  };
}

type ReturnType = {
  fetchMore: () => Promise<void>;
  state: RowsState;
  hasMore: boolean;
  loading: boolean;
  error?: ApolloErrorType;
  client: ApolloClient<any>;
};

export default function useSqlSelectRows(
  params: SqlQueryParams,
  forceNetworkRun?: boolean,
): ReturnType {
  const [adopted, setAdopted] = useState<PendingSqlResult | undefined>(
    undefined,
  );
  const [, rerenderOnSet] = useReducer((x: number) => x + 1, 0);
  useEffect(() => subscribePendingSqlResult(rerenderOnSet), []);

  const mailboxed = peekPendingSqlResult();
  const incoming =
    mailboxed && pendingSqlResultMatches(mailboxed, params)
      ? mailboxed
      : undefined;
  const retained =
    adopted && pendingSqlResultMatches(adopted, params) ? adopted : undefined;
  const handoffData = forceNetworkRun
    ? undefined
    : (incoming ?? retained)?.data;

  useEffect(() => {
    if (!incoming) return;
    setAdopted(incoming);
    if (peekPendingSqlResult() === incoming) {
      clearPendingSqlResult();
    }
  }, [incoming]);

  const variables = {
    databaseName: params.databaseName,
    refName: params.refName,
    queryString: params.q,
    schemaName: params.schemaName || undefined,
  };

  const { data, loading, error, client } = useSqlSelectForSqlDataTableQuery({
    variables,
    fetchPolicy: forceNetworkRun ? "network-only" : "cache-first",
    skip: !!handoffData,
  });

  const [state, setState] = useSetState(getDefaultState(handoffData ?? data));
  const [lastOffset, setLastOffset] = useState<Maybe<number>>(undefined);
  const [err, setErr] = useApolloError(error);

  useEffect(() => {
    if (handoffData) {
      setState(getDefaultState(handoffData));
      return;
    }
    if (loading || error || !data) return;
    setState(getDefaultState(data));
  }, [loading, error, data, handoffData, setState]);

  const handleQuery = async (
    setRows: (rows: RowForDataTableFragment[]) => void,
    offset: Maybe<number>,
  ) => {
    if (err) setErr(undefined);
    if (offset === undefined || offset === null) {
      return;
    }
    setLastOffset(offset);
    try {
      const res = await client.query<
        SqlSelectForSqlDataTableQuery,
        SqlSelectForSqlDataTableQueryVariables
      >({
        query: SqlSelectForSqlDataTableDocument,
        variables: { ...variables, offset },
      });
      setRows(res.data.sqlSelect.rows.list);
      setState({ offset: res.data.sqlSelect.rows.nextOffset });
    } catch (er) {
      handleCaughtApolloError(er, setErr);
    }
  };

  const fetchMore = async () => {
    const setRows = (rs: RowForDataTableFragment[]) =>
      setState({ rows: state.rows.concat(rs) });
    await handleQuery(setRows, state.offset);
  };

  const hasMore =
    state.offset !== undefined &&
    state.offset !== null &&
    state.offset !== lastOffset;

  return { state, fetchMore, hasMore, loading, error: err, client };
}
