import { ApolloError } from "@apollo/client";
import ErrorMsg from "@components/ErrorMsg";
import Loader from "@components/Loader";
import { useDataTableContext } from "@contexts/dataTable";
import {
  ColumnForDataTableFragment,
  Maybe,
  RowForDataTableFragment,
} from "@gen/graphql-types";
import DataTableLayout from "@layouts/DataTableLayout";
import { RefParams, SqlQueryParams, TableParams } from "@lib/params";
import { ReactNode } from "react";
import AddRowsButton from "./AddRowsButton";
import ShowAllColumns from "./ShowAllColumns";
import Table from "./Table";
import css from "./index.module.css";

type Props = {
  hasMore?: boolean;
  loadMore: () => void;
  nextPage: () => void;
  rows?: RowForDataTableFragment[];
  columns?: ColumnForDataTableFragment[];
  message?: ReactNode | null;
  params: RefParams & { tableName?: Maybe<string>; q: string };
  error?: ApolloError;
};

export function Inner({ columns, rows, message = null, ...props }: Props) {
  return (
    <div className={css.wrapper}>
      <div>
        <div className={css.top}>
          <div data-cy="data-table-message">{message}</div>
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
  const { loading, hasMore, loadMore, nextPage, rows, columns, error } =
    useDataTableContext();

  if (loading) return <Loader loaded={false} />;

  return (
    <Inner
      params={props.params}
      loadMore={loadMore}
      nextPage={nextPage}
      rows={rows}
      columns={columns}
      hasMore={hasMore}
      error={error}
    />
  );
}

export default function DataTable(props: { params: DataTableParams }) {
  const params: SqlQueryParams = {
    ...props.params,
    q: `SELECT * FROM \`${props.params.tableName}\``,
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
