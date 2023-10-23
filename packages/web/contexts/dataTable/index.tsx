import { ApolloError } from "@apollo/client";
import {
  ColumnForDataTableFragment,
  ForeignKeysForDataTableFragment,
  RowForDataTableFragment,
  RowsForDataTableQuery,
  RowsForDataTableQueryDocument,
  RowsForDataTableQueryVariables,
  useDataTableQuery,
  useRowsForDataTableQuery,
} from "@gen/graphql-types";
import useContextWithError from "@hooks/useContextWithError";
import Maybe from "@lib/Maybe";
import { createCustomContext } from "@lib/createCustomContext";
import { RefParams, SqlQueryParams, TableParams } from "@lib/params";
import { isMutation, tryTableNameForSelect } from "@lib/parseSqlQuery";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";

type DataTableParams = TableParams & { offset?: number };

// This context handles data tables on the database page (for tables and queries)
type DataTableContextType = {
  params: RefParams & { tableName?: string; q?: string };
  loading: boolean;
  loadMore: () => Promise<void>;
  rows?: RowForDataTableFragment[];
  hasMore: boolean;
  columns?: ColumnForDataTableFragment[];
  foreignKeys?: ForeignKeysForDataTableFragment[];
  error?: ApolloError;
};

export const DataTableContext =
  createCustomContext<DataTableContextType>("DataTableContext");

type Props = {
  params: DataTableParams | SqlQueryParams;
  children: ReactNode;
};

type TableProps = Props & {
  params: DataTableParams;
};

function ProviderForTableName(props: TableProps) {
  // Get data table data
  const tableRes = useDataTableQuery({
    variables: props.params,
  });
  const rowRes = useRowsForDataTableQuery({
    variables: props.params,
  });

  const [rows, setRows] = useState(rowRes.data?.rows.list);
  const [offset, setOffset] = useState(rowRes.data?.rows.nextOffset);
  const [lastOffset, setLastOffset] = useState<Maybe<number>>(undefined);

  useEffect(() => {
    setRows(rowRes.data?.rows.list);
    setOffset(rowRes.data?.rows.nextOffset);
  }, [rowRes.data]);

  const loadMore = useCallback(async () => {
    if (offset === undefined) {
      return;
    }
    setLastOffset(offset);
    const res = await rowRes.client.query<
      RowsForDataTableQuery,
      RowsForDataTableQueryVariables
    >({
      query: RowsForDataTableQueryDocument,
      variables: {
        ...props.params,
        offset,
      },
    });
    const newRows = res.data.rows.list;
    const newOffset = res.data.rows.nextOffset;
    setRows((rows ?? []).concat(newRows));
    setOffset(newOffset);
  }, [offset, props.params, rowRes.client, rows]);

  const value = useMemo(() => {
    return {
      params: props.params,
      loading: tableRes.loading || rowRes.loading,
      loadMore,
      rows,
      hasMore: offset !== undefined && offset !== null && offset !== lastOffset,
      columns: tableRes.data?.table.columns,
      foreignKeys: tableRes.data?.table.foreignKeys,
      error: tableRes.error ?? rowRes.error,
    };
  }, [
    loadMore,
    offset,
    lastOffset,
    props.params,
    rowRes.error,
    rowRes.loading,
    rows,
    tableRes.data?.table.columns,
    tableRes.data?.table.foreignKeys,
    tableRes.error,
    tableRes.loading,
  ]);

  return (
    <DataTableContext.Provider value={value}>
      {props.children}
    </DataTableContext.Provider>
  );
}

// DataTableProvider should only wrap DatabasePage.ForTable and DatabasePage.ForQueries
export function DataTableProvider({ params, children }: Props) {
  const tableName =
    "tableName" in params ? params.tableName : tryTableNameForSelect(params.q);

  const value = useMemo(() => {
    return {
      params,
      loading: false,
      loadMore: async () => {},
      hasMore: false,
    };
  }, [params]);

  const isMut = "q" in params && isMutation(params.q);
  if (isMut || !tableName) {
    return (
      <DataTableContext.Provider value={value}>
        {children}
      </DataTableContext.Provider>
    );
  }

  return (
    <ProviderForTableName params={{ ...params, tableName }}>
      {children}
    </ProviderForTableName>
  );
}

export function useDataTableContext(): DataTableContextType {
  return useContextWithError(DataTableContext);
}
