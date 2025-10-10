import { ApolloError } from "@apollo/client";
import { useDataTableContext } from "@contexts/dataTable";
import { ErrorMsg, Loader } from "@dolthub/react-components";
import { Maybe } from "@dolthub/web-utils";
import {
  ColumnForDataTableFragment,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import useSqlBuilder from "@hooks/useSqlBuilder";
import DataTableLayout from "@layouts/DataTableLayout";
import { RefParams, SqlQueryParams, TableParams } from "@lib/params";
import { ReactNode } from "react";
import AddRowsButton from "./AddRowsButton";
import ShowAllColumns from "./ShowAllColumns";
import Table from "./Table";
import css from "./index.module.css";
import Warnings from "./Warnings";

type Props = {
  hasMore?: boolean;
  loadMore: () => Promise<void>;
  rows?: RowForDataTableFragment[];
  columns?: ColumnForDataTableFragment[];
  message?: ReactNode | null;
  params: RefParams & { tableName?: Maybe<string>; q: string };
  error?: ApolloError;
  warnings?: Maybe<string[]>;
};

export function Inner({ columns, rows, message = null, ...props }: Props) {
  return (
    <div className={css.wrapper}>
      <div>
        <div className={css.top}>
          <div data-cy="data-table-message">{message}</div>
          {props.warnings && <Warnings warnings={props.warnings} />}
          <ShowAllColumns />
        </div>
        {rows && columns ? (
          <div className={css.bottom}>
            <Table {...props} rows={rows} columns={columns} />
          </div>
        ) : (
          <p data-cy="db-data-table-empty" className={css.noData}>
            No table data found
          </p>
        )}
        <ErrorMsg err={props.error} />
      </div>
      <div className={css.gradientOverlay} />
    </div>
  );
}

type DataTableParams = TableParams & { offset?: Maybe<number> };

type TableProps = {
  params: DataTableParams & { q: string };
};

function WithContext(props: TableProps) {
  const {
    loading,
    loadingWorkingDiff,
    hasMore,
    hasMoreWorkingDiff,
    loadMore,
    loadMoreWorkingDiff,
    rows,
    workingDiffRows,
    columns,
    error,
    errorWorkingDiff,
    workingDiffRowsToggled,
  } = useDataTableContext();

  if (
    (!workingDiffRowsToggled && loading) ||
    (workingDiffRowsToggled && loadingWorkingDiff)
  ) {
    return <Loader loaded={false} />;
  }

  return (
    <Inner
      params={props.params}
      loadMore={workingDiffRowsToggled ? loadMoreWorkingDiff : loadMore}
      rows={workingDiffRowsToggled ? workingDiffRows : rows}
      columns={columns}
      hasMore={workingDiffRowsToggled ? hasMoreWorkingDiff : hasMore}
      error={workingDiffRowsToggled ? errorWorkingDiff : error}
    />
  );
}

export default function DataTable(props: { params: DataTableParams }) {
  const { selectFromTable } = useSqlBuilder();
  const params: SqlQueryParams = {
    ...props.params,
    q: selectFromTable(props.params.tableName),
  };
  return (
    <>
      <DataTableLayout params={params} tableName={props.params.tableName}>
        <WithContext params={{ ...props.params, q: params.q }} />
      </DataTableLayout>
      <AddRowsButton {...props} />
    </>
  );
}
