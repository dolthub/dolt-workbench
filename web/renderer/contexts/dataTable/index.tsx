import { ApolloError } from "@apollo/client";
import { createCustomContext } from "@dolthub/react-contexts";
import { useContextWithError } from "@dolthub/react-hooks";
import { Maybe } from "@dolthub/web-utils";
import {
  ColumnForDataTableFragment,
  ForeignKeysForDataTableFragment,
  RowForDataTableFragment,
  RowsForDataTableQuery,
  RowsForDataTableQueryDocument,
  RowsForDataTableQueryVariables,
  useDataTableQuery,
  useRowsForDataTableQuery,
  useWorkingDiffRowsForDataTableQuery,
  WorkingDiffRowsForDataTableQuery, WorkingDiffRowsForDataTableQueryDocument,
  WorkingDiffRowsForDataTableQueryVariables,
} from "@gen/graphql-types";
import useSqlParser from "@hooks/useSqlParser";
import {
  RefOptionalSchemaParams,
  SqlQueryParams,
  TableParams,
} from "@lib/params";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { generateEmptyRow } from "./utils";

type DataTableParams = TableParams & {
  offset?: number;
  schemaName?: string;
};

// This context handles data tables on the database page (for tables and queries)
type DataTableContextType = {
  params: RefOptionalSchemaParams & { tableName?: string; q?: string };
  loading: boolean;
  loadingWorkingDiff: boolean;
  loadMore: () => Promise<void>;
  loadMoreWorkingDiff: () => Promise<void>;
  rows?: RowForDataTableFragment[];
  workingDiffRows?: RowForDataTableFragment[];
  hasMore: boolean;
  hasMoreWorkingDiff: boolean;
  columns?: ColumnForDataTableFragment[];
  foreignKeys?: ForeignKeysForDataTableFragment[];
  error?: ApolloError;
  errorWorkingDiff?: ApolloError;
  showingWorkingDiff: boolean;
  tableNames: string[];
  onAddEmptyRow: () => void;
  pendingRow?: RowForDataTableFragment;
  setPendingRow: (r: RowForDataTableFragment | undefined) => void;
  workingDiffRowsToggled?: boolean;
  setWorkingDiffRowsToggled: (toggled: boolean) => void;
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

  const rowRes = useRowsForDataTableQuery({
    variables: { ...props.params },
  });

  const rowWithDiffRes = useRowsForDataTableQuery({
    variables: { ...props.params, withDiff: true },
  });

  const diffOnlyRes = useWorkingDiffRowsForDataTableQuery({
    variables: { ...props.params }
  })

  const [rows, setRows] = useState(
    rowWithDiffRes.data?.rows.list ?? rowRes.data?.rows.list,
  );
  const [workingDiffRows, setWorkingDiffRows] = useState(
    diffOnlyRes.data?.workingDiffRows.list
  )
  const [diffQueryOffset, setDiffQueryOffset] = useState(diffOnlyRes.data?.workingDiffRows.nextOffset);
  const [lastDiffQueryOffset, setLastDiffQueryOffset] = useState<Maybe<number>>(undefined);
  const [workingDiffRowsToggled, setWorkingDiffRowsToggled] = useState(false);

  const [pendingRow, setPendingRow] = useState<
    RowForDataTableFragment | undefined
  >(undefined);
  const [offset, setOffset] = useState(rowRes.data?.rows.nextOffset);
  const [lastOffset, setLastOffset] = useState<Maybe<number>>(undefined);

  useEffect(() => {
    setRows(rowWithDiffRes.data?.rows.list ?? rowRes.data?.rows.list);
    setOffset(rowRes.data?.rows.nextOffset);
  }, [rowRes.data, rowWithDiffRes.data]);

  useEffect(() => {
    setWorkingDiffRows(diffOnlyRes.data?.workingDiffRows.list);
    setDiffQueryOffset(diffOnlyRes.data?.workingDiffRows.nextOffset);
  }, [diffOnlyRes.data])

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

    const prevRowsLength = rows?.length ?? 0;
    const newRows = res.data.rows.list;
    const newOffset = res.data.rows.nextOffset;

    setRows(prevRows => (prevRows ?? []).concat(newRows));
    setOffset(newOffset);

    const diffRes = await rowWithDiffRes.client.query<
      RowsForDataTableQuery,
      RowsForDataTableQueryVariables
    >({
      query: RowsForDataTableQueryDocument,
      variables: {
        ...props.params,
        offset,
        withDiff: true,
      },
    });

    setRows(currentRows => {
      if (currentRows) {
        return [
          ...currentRows.slice(0, prevRowsLength),
          ...diffRes.data.rows.list,
        ];
      } else {
        return diffRes.data.rows.list;
      }
    });

  }, [offset, props.params, rowRes.client, rowWithDiffRes.client, rows]);

  const loadMoreWorkingDiff = useCallback(async () => {
    if (diffQueryOffset === undefined) {
      return;
    }
    setLastDiffQueryOffset(diffQueryOffset);
    const res = await diffOnlyRes.client.query<
      WorkingDiffRowsForDataTableQuery,
      WorkingDiffRowsForDataTableQueryVariables
    >({
      query: WorkingDiffRowsForDataTableQueryDocument,
      variables: {
        ...props.params,
        offset: diffQueryOffset,
      },
    });

    const newWorkingDiffRows = res.data.workingDiffRows.list;
    const newDiffQueryOffset = res.data.workingDiffRows.nextOffset;

    setRows(prevWorkingDiffRows => (prevWorkingDiffRows ?? []).concat(newWorkingDiffRows));
    setDiffQueryOffset(newDiffQueryOffset);

  }, [diffQueryOffset, props.params, diffOnlyRes.client]);

  const onAddEmptyRow = () => {
    const emptyRow = generateEmptyRow(tableRes.data?.table.columns ?? []);
    setPendingRow(emptyRow);
  };

  const value = useMemo(() => {
    return {
      params: props.params,
      loading: tableRes.loading || rowRes.loading,
      loadingWorkingDiff: tableRes.loading || diffOnlyRes.loading,
      loadMore,
      loadMoreWorkingDiff,
      rows,
      workingDiffRows,
      workingDiffRowsToggled,
      setWorkingDiffRowsToggled,
      hasMore: offset !== undefined && offset !== null && offset !== lastOffset,
      hasMoreWorkingDiff: diffQueryOffset !== undefined && diffQueryOffset !== null && diffQueryOffset !== lastDiffQueryOffset,
      columns: tableRes.data?.table.columns,
      foreignKeys: tableRes.data?.table.foreignKeys,
      error: tableRes.error ?? rowRes.error,
      errorWorkingDiff: tableRes.error ?? diffOnlyRes.error,
      showingWorkingDiff: !!props.showingWorkingDiff,
      tableNames: props.tableNames,
      onAddEmptyRow,
      pendingRow,
      setPendingRow,
    };
  }, [
    loadMore,
    loadMoreWorkingDiff,
    offset,
    lastOffset,
    diffQueryOffset,
    lastDiffQueryOffset,
    props.params,
    rowRes.error,
    rowRes.loading,
    diffOnlyRes.error,
    diffOnlyRes.loading,
    workingDiffRowsToggled,
    setWorkingDiffRowsToggled,
    rows,
    workingDiffRows,
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
      loadingWorkingDiff: false,
      loadMore: async () => {},
      loadMoreWorkingDiff: async () => {},
      hasMore: false,
      hasMoreWorkingDiff: false,
      showingWorkingDiff: !!showingWorkingDiff,
      tableNames,
      onAddEmptyRow: () => {},
      pendingRow: undefined,
      setPendingRow: () => {},
      setWorkingDiffRowsToggled: () => {}
    };
  }, [loading, params, showingWorkingDiff, tableNames]);

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
