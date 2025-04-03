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
import { useEffect, useState } from "react";

export const defaultState = {
  offset: undefined as Maybe<number>,
  rows: [] as RowForDataTableFragment[],
  cols: [] as ColumnForSqlDataTableFragment[],
  warnings: [] as string[],
  executionStatus: undefined as unknown as QueryExecutionStatus,
  executionMessage: "",
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

export default function useSqlSelectRows(params: SqlQueryParams): ReturnType {
  const { data, loading, error, client } = useSqlSelectForSqlDataTableQuery({
    variables: {
      databaseName: params.databaseName,
      refName: params.refName,
      queryString: params.q,
      schemaName: params.schemaName,
    },
    fetchPolicy: "cache-and-network",
  });

  const [state, setState] = useSetState(getDefaultState(data));
  const [lastOffset, setLastOffset] = useState<Maybe<number>>(undefined);
  const [err, setErr] = useApolloError(error);

  useEffect(() => {
    if (loading || error || !data) return;
    setState(getDefaultState(data));
  }, [loading, error, data, setState]);

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
        variables: { ...params, queryString: params.q, offset },
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
