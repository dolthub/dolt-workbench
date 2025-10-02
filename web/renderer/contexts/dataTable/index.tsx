import { ApolloError } from "@apollo/client";
import { createCustomContext } from "@dolthub/react-contexts";
import { useContextWithError } from "@dolthub/react-hooks";
import { Maybe } from "@dolthub/web-utils";
import {
  ColumnForDataTableFragment,
  ForeignKeysForDataTableFragment,
  RowForDataTableFragment,
  RowsWithDiffForDataTableQuery,
  RowsWithDiffForDataTableQueryDocument,
  RowsWithDiffForDataTableQueryVariables, RowWithDiff,
  useDataTableQuery,
  useRowsWithDiffForDataTableQuery,
} from "@gen/graphql-types";
import useSqlParser from "@hooks/useSqlParser";
import {
  RefOptionalSchemaParams,
  SqlQueryParams,
  TableParams,
} from "@lib/params";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { generateEmptyRow } from "./utils";

type DataTableParams = TableParams & { offset?: number; schemaName?: string, withDiff?: boolean };

// This context handles data tables on the database page (for tables and queries)
type DataTableContextType = {
  params: RefOptionalSchemaParams & { tableName?: string; q?: string };
  loading: boolean;
  loadMore: () => Promise<void>;
  rows?: RowForDataTableFragment[];
  diffs?: RowWithDiff[];
  hasMore: boolean;
  columns?: ColumnForDataTableFragment[];
  foreignKeys?: ForeignKeysForDataTableFragment[];
  error?: ApolloError;
  showingWorkingDiff: boolean;
  tableNames: string[];
  onAddEmptyRow: () => void;
  pendingRow?: RowForDataTableFragment;
  setPendingRow: (r: RowForDataTableFragment | undefined) => void;
};

export const DataTableContext =
  createCustomContext<DataTableContextType>("DataTableContext");

type Props = {
  params: DataTableParams | SqlQueryParams;
  children: ReactNode;
  showingWorkingDiff?: boolean;
};

type TableProps = Props & {
  params: DataTableParams;
  tableNames: string[];
};

function ProviderForTableName(props: TableProps) {
  // Get data table data
  const tableRes = useDataTableQuery({
    variables: props.params,
  });

  const rowRes = useRowsWithDiffForDataTableQuery({
    variables: {...props.params },
  });


  const [rows, setRows] = useState(rowRes.data?.rowsWithWorkingDiff.list);
  const [diffs, setDiffs] = useState(rowRes.data?.rowsWithWorkingDiff.diffs ?? []);
  const [pendingRow, setPendingRow] = useState<
    RowForDataTableFragment | undefined
  >(undefined);
  const [offset, setOffset] = useState(rowRes.data?.rowsWithWorkingDiff.nextOffset);
  const [lastOffset, setLastOffset] = useState<Maybe<number>>(undefined);

  useEffect(() => {
    setRows(rowRes.data?.rowsWithWorkingDiff.list);
    setDiffs(rowRes.data?.rowsWithWorkingDiff.diffs ?? []);
    setOffset(rowRes.data?.rowsWithWorkingDiff.nextOffset);
  }, [rowRes.data]);

  const loadMore = useCallback(async () => {
    if (offset === undefined) {
      return;
    }
    setLastOffset(offset);
    const res = await rowRes.client.query<
      RowsWithDiffForDataTableQuery,
      RowsWithDiffForDataTableQueryVariables
    >({
      query: RowsWithDiffForDataTableQueryDocument,
      variables: {
        ...props.params,
        offset,
      },
    });
    const newRows = res.data.rowsWithWorkingDiff.list;
    const newDiffs = res.data.rowsWithWorkingDiff.diffs;
    console.log("NEW ROWS: ", newRows);
    console.log("NEW DIFFS: ", newDiffs);
    const newOffset = res.data.rowsWithWorkingDiff.nextOffset;
    setRows((rows ?? []).concat(newRows));
    setDiffs(diffs.concat(newDiffs ?? []));
    setOffset(newOffset);
  }, [offset, props.params, rowRes.client, rows, diffs]);

  const onAddEmptyRow = () => {
    const emptyRow = generateEmptyRow(tableRes.data?.table.columns ?? []);
    setPendingRow(emptyRow);
  };

  const value = useMemo(() => {
    return {
      params: props.params,
      loading: tableRes.loading || rowRes.loading,
      loadMore,
      rows,
      diffs,
      hasMore: offset !== undefined && offset !== null && offset !== lastOffset,
      columns: tableRes.data?.table.columns,
      foreignKeys: tableRes.data?.table.foreignKeys,
      error: tableRes.error ?? rowRes.error,
      showingWorkingDiff: !!props.showingWorkingDiff,
      tableNames: props.tableNames,
      onAddEmptyRow,
      pendingRow,
      setPendingRow,
    };
  }, [
    loadMore,
    offset,
    lastOffset,
    props.params,
    rowRes.error,
    rowRes.loading,
    rows,
    diffs,
    tableRes.data?.table.columns,
    tableRes.data?.table.foreignKeys,
    tableRes.error,
    tableRes.loading,
    props.showingWorkingDiff,
    props.tableNames,
    onAddEmptyRow,
    pendingRow,
    setPendingRow,
  ]);

  return (
    <DataTableContext.Provider value={value}>
      {props.children}
    </DataTableContext.Provider>
  );
}

// DataTableProvider should only wrap DatabasePage.ForTable and DatabasePage.ForQueries
export function DataTableProvider({
  params,
  children,
  showingWorkingDiff,
}: Props) {
  const { isMutation, requireTableNamesForSelect, loading } = useSqlParser();
  const tableNames = useMemo(
    () =>
      "tableName" in params
        ? [params.tableName]
        : requireTableNamesForSelect(params.q),
    [params, loading],
  );

  const value = useMemo(() => {
    return {
      params,
      loading,
      loadMore: async () => {},
      hasMore: false,
      showingWorkingDiff: !!showingWorkingDiff,
      tableNames,
      onAddEmptyRow: () => {},
      pendingRow: undefined,
      setPendingRow: () => {},
    };
  }, [params, showingWorkingDiff, tableNames]);

  const isMut = "q" in params && isMutation(params.q);
  if (isMut || !tableNames.length) {
    return (
      <DataTableContext.Provider value={value}>
        {children}
      </DataTableContext.Provider>
    );
  }

  return (
    <ProviderForTableName
      params={{ ...params, tableName: tableNames[0] }}
      tableNames={tableNames}
    >
      {children}
    </ProviderForTableName>
  );
}

export function useDataTableContext(): DataTableContextType {
  return useContextWithError(DataTableContext);
}
