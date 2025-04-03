import { ApolloClient } from "@apollo/client";
import { useSetState } from "@dolthub/react-hooks";
import { Maybe } from "@dolthub/web-utils";
import {
  ColumnForSqlDataTableFragment,
  RowForDataTableFragment,
  RowListForSqlDataTableRowsFragment,
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
};
export type RowsState = typeof defaultState;

function getDefaultState(
  rowList?: RowListForSqlDataTableRowsFragment,
  cols?: ColumnForSqlDataTableFragment[],
  warnings?: string[],
): RowsState {
  return {
    ...defaultState,
    rows: rowList?.list ?? [],
    cols: cols ?? [],
    offset: rowList?.nextOffset,
    warnings: warnings ?? [],
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

  const [state, setState] = useSetState(
    getDefaultState(
      data?.sqlSelect.rows,
      data?.sqlSelect.columns,
      data?.sqlSelect.warnings || [],
    ),
  );
  const [lastOffset, setLastOffset] = useState<Maybe<number>>(undefined);
  const [err, setErr] = useApolloError(error);

  useEffect(() => {
    if (loading || error || !data) return;
    setState(
      getDefaultState(
        data.sqlSelect.rows,
        data.sqlSelect.columns,
        data.sqlSelect.warnings || [],
      ),
    );
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
      console.log(res.data.sqlSelect.rows.list);
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
