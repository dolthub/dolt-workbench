import { ApolloError } from "@apollo/client";
import { useContextWithError } from "@dolthub/react-hooks";
import { Maybe } from "@dolthub/web-utils";
import {
  ColumnForDataTableFragment,
  ColumnValue,
  ForeignKeysForDataTableFragment,
  RowForDataTableFragment,
  RowsForDataTableQuery,
  RowsForDataTableQueryDocument,
  RowsForDataTableQueryVariables,
  useDataTableQuery,
  useRowsForDataTableQuery,
} from "@gen/graphql-types";
import useSqlParser from "@hooks/useSqlParser";
import { createCustomContext } from "@lib/createCustomContext";
import {
  RefOptionalSchemaParams,
  SqlQueryParams,
  TableParams,
} from "@lib/params";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";

type DataTableParams = TableParams & { offset?: number; schemaName?: string };

// This context handles data tables on the database page (for tables and queries)
type DataTableContextType = {
  params: RefOptionalSchemaParams & { tableName?: string; q?: string };
  loading: boolean;
  loadMore: () => Promise<void>;
  rows?: RowForDataTableFragment[];
  hasMore: boolean;
  columns?: ColumnForDataTableFragment[];
  foreignKeys?: ForeignKeysForDataTableFragment[];
  error?: ApolloError;
  showingWorkingDiff: boolean;
  tableNames: string[];
  onAddRow: () => void;
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

  const rowRes = useRowsForDataTableQuery({
    variables: props.params,
  });

  const [rows, setRows] = useState(rowRes.data?.rows.list);
  const [pendingRow, setPendingRow] = useState<
    RowForDataTableFragment | undefined
  >(undefined);
  const [offset, setOffset] = useState(rowRes.data?.rows.nextOffset);
  const [lastOffset, setLastOffset] = useState<Maybe<number>>(undefined);
  console.log("pendingRow", pendingRow);
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

  const onAddRow = () => {
    const emptyRow = generateEmptyRow(tableRes.data?.table.columns ?? []);
    setPendingRow(emptyRow);
  };

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
      showingWorkingDiff: !!props.showingWorkingDiff,
      tableNames: props.tableNames,
      onAddRow,
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
    tableRes.data?.table.columns,
    tableRes.data?.table.foreignKeys,
    tableRes.error,
    tableRes.loading,
    props.showingWorkingDiff,
    props.tableNames,
    onAddRow,
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
      onAddRow: () => {},
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

function generateEmptyRow(
  columns: ColumnForDataTableFragment[],
): RowForDataTableFragment {
  const emptyRow = columns.map(column => {
    const isNotNull =
      column.constraints?.some(constraint => constraint.notNull) || false;

    let value: string;
    if (isNotNull) {
      switch (column.type.toLowerCase()) {
        case "int":
        case "integer":
        case "bigint":
          value = "0"; // Default integer value
          break;
        case "varchar":
        case "char":
        case "text":
        case "string":
          value = ""; // Empty string
          break;
        case "datetime":
        case "timestamp":
          value = new Date().toISOString(); // Current timestamp
          break;
        case "boolean":
          value = "false";
          break;
        default:
          value = "";
          break;
      }
    } else {
      value = "";
    }

    return { __typename: "ColumnValue", displayValue: value } as ColumnValue;
  });

  return { __typename: "Row", columnValues: emptyRow };
}
