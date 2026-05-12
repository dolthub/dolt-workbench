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
  SelectTableRowsForDataTableQuery,
  SelectTableRowsForDataTableDocument,
  SelectTableRowsForDataTableQueryVariables,
  useDataTableQuery,
  useRowsForDataTableQuery,
  useSelectTableRowsForDataTableQuery,
  useWorkingDiffRowsForDataTableQuery,
  WorkingDiffRowsForDataTableQuery,
  WorkingDiffRowsForDataTableQueryDocument,
  WorkingDiffRowsForDataTableQueryVariables,
} from "@gen/graphql-types";
import useSqlParser from "@hooks/useSqlParser";
import { parseStackingParams } from "@lib/dataTableParams";
import {
  RefOptionalSchemaParams,
  SqlQueryParams,
  TableParams,
} from "@lib/params";
import { useRouter } from "next/router";
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
  diffExists: boolean;
  tableShape: boolean;
  executedQueryString?: string;
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
  tableShape: boolean;
};

function ProviderForTableName(props: TableProps) {
  const router = useRouter();
  // Depend on the individual param strings: router.query is a fresh object
  // every render and would make `stack` reference-unstable.
  const orderByParam = router.query.orderBy;
  const whereParam = router.query.where;
  const hideParam = router.query.hide;
  const projectionParam = router.query.projection;

  const tableRes = useDataTableQuery({
    variables: props.params,
  });
  const tableColumns = tableRes.data?.table.columns;

  const stack = useMemo(
    () => parseStackingParams(router.query, tableColumns ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orderByParam, whereParam, hideParam, projectionParam, tableColumns],
  );
  const hasStacking = !!(
    stack.orderBy?.length ||
    stack.where?.length ||
    stack.excludePks?.length ||
    stack.projection?.length
  );

  const selectTableRowsRes = useSelectTableRowsForDataTableQuery({
    variables: {
      ...props.params,
      orderBy: stack.orderBy,
      where: stack.where,
      excludePks: stack.excludePks,
      projection: stack.projection,
    },
  });

  const rowWithDiffRes = useRowsForDataTableQuery({
    variables: { ...props.params, withDiff: true },
  });

  const diffOnlyRes = useWorkingDiffRowsForDataTableQuery({
    variables: props.params,
  });

  const [rows, setRows] = useState(
    hasStacking
      ? selectTableRowsRes.data?.selectTableRows.rows.list
      : (rowWithDiffRes.data?.rows.list ??
          selectTableRowsRes.data?.selectTableRows.rows.list),
  );
  const [workingDiffRows, setWorkingDiffRows] = useState(
    diffOnlyRes.data?.workingDiffRows.list,
  );
  const [diffQueryOffset, setDiffQueryOffset] = useState(
    diffOnlyRes.data?.workingDiffRows.nextOffset,
  );
  const [lastDiffQueryOffset, setLastDiffQueryOffset] =
    useState<Maybe<number>>(undefined);
  const [workingDiffRowsToggled, setWorkingDiffRowsToggled] = useState(false);

  const [pendingRow, setPendingRow] = useState<
    RowForDataTableFragment | undefined
  >(undefined);
  const [offset, setOffset] = useState(
    selectTableRowsRes.data?.selectTableRows.rows.nextOffset,
  );
  const [lastOffset, setLastOffset] = useState<Maybe<number>>(undefined);

  useEffect(() => {
    setRows(
      hasStacking
        ? selectTableRowsRes.data?.selectTableRows.rows.list
        : (rowWithDiffRes.data?.rows.list ??
            selectTableRowsRes.data?.selectTableRows.rows.list),
    );
    setOffset(selectTableRowsRes.data?.selectTableRows.rows.nextOffset);
    // Stale lastOffset would falsely disable pagination after a query change.
    setLastOffset(undefined);
  }, [selectTableRowsRes.data, rowWithDiffRes.data, hasStacking]);

  useEffect(() => {
    setWorkingDiffRows(diffOnlyRes.data?.workingDiffRows.list);
    setDiffQueryOffset(diffOnlyRes.data?.workingDiffRows.nextOffset);
  }, [diffOnlyRes.data]);

  const loadMore = useCallback(async () => {
    if (offset === undefined) {
      return;
    }
    setLastOffset(offset);
    const res = await selectTableRowsRes.client.query<
      SelectTableRowsForDataTableQuery,
      SelectTableRowsForDataTableQueryVariables
    >({
      query: SelectTableRowsForDataTableDocument,
      variables: {
        ...props.params,
        orderBy: stack.orderBy,
        where: stack.where,
        excludePks: stack.excludePks,
        projection: stack.projection,
        offset,
      },
    });

    const prevRowsLength = rows?.length ?? 0;
    const newRows = res.data.selectTableRows.rows.list;
    const newOffset = res.data.selectTableRows.rows.nextOffset;

    setRows(prevRows => (prevRows ?? []).concat(newRows));
    setOffset(newOffset);

    if (hasStacking) return;

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
  }, [
    offset,
    props.params,
    selectTableRowsRes.client,
    rowWithDiffRes.client,
    rows,
    stack,
    hasStacking,
  ]);

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

    setWorkingDiffRows(prevWorkingDiffRows =>
      (prevWorkingDiffRows ?? []).concat(newWorkingDiffRows),
    );
    setDiffQueryOffset(newDiffQueryOffset);
  }, [diffQueryOffset, props.params, diffOnlyRes.client]);

  const onAddEmptyRow = () => {
    const emptyRow = generateEmptyRow(tableRes.data?.table.columns ?? []);
    setPendingRow(emptyRow);
  };

  // Align columns with columnValues; Row.tsx returns null on length mismatch.
  const allColumns = tableRes.data?.table.columns;
  const visibleColumns = useMemo(() => {
    if (!allColumns) return allColumns;
    if (!stack.projection || stack.projection.length === 0) return allColumns;
    const set = new Set(stack.projection);
    return allColumns.filter(c => set.has(c.name));
  }, [allColumns, stack.projection]);

  const value = useMemo(() => {
    return {
      params: props.params,
      loading: tableRes.loading || selectTableRowsRes.loading,
      loadingWorkingDiff: tableRes.loading || diffOnlyRes.loading,
      loadMore,
      loadMoreWorkingDiff,
      rows,
      workingDiffRows,
      workingDiffRowsToggled,
      setWorkingDiffRowsToggled,
      hasMore: offset !== undefined && offset !== null && offset !== lastOffset,
      hasMoreWorkingDiff:
        diffQueryOffset !== undefined &&
        diffQueryOffset !== null &&
        diffQueryOffset !== lastDiffQueryOffset,
      columns: visibleColumns,
      foreignKeys: tableRes.data?.table.foreignKeys,
      error: tableRes.error ?? selectTableRowsRes.error,
      errorWorkingDiff: tableRes.error ?? diffOnlyRes.error,
      showingWorkingDiff: !!props.showingWorkingDiff,
      tableNames: props.tableNames,
      onAddEmptyRow,
      pendingRow,
      setPendingRow,
      diffExists:
        !("q" in props.params) &&
        !!workingDiffRows &&
        workingDiffRows.length > 0,
      tableShape: props.tableShape,
      executedQueryString: hasStacking
        ? selectTableRowsRes.data?.selectTableRows.queryString
        : undefined,
    };
  }, [
    loadMore,
    loadMoreWorkingDiff,
    offset,
    lastOffset,
    diffQueryOffset,
    lastDiffQueryOffset,
    props.params,
    props.tableShape,
    hasStacking,
    selectTableRowsRes.data,
    selectTableRowsRes.error,
    selectTableRowsRes.loading,
    diffOnlyRes.error,
    diffOnlyRes.loading,
    workingDiffRowsToggled,
    setWorkingDiffRowsToggled,
    rows,
    workingDiffRows,
    visibleColumns,
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
  const tableShape = "tableName" in params;

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
      setWorkingDiffRowsToggled: () => {},
      diffExists: false,
      tableShape,
    };
  }, [loading, params, showingWorkingDiff, tableNames, tableShape]);

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
      tableShape={tableShape}
    >
      {children}
    </ProviderForTableName>
  );
}

export function useDataTableContext(): DataTableContextType {
  return useContextWithError(DataTableContext);
}
