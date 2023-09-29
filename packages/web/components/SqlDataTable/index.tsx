import {
  ApolloClient,
  ApolloError,
  NormalizedCacheObject,
} from "@apollo/client";
import Button from "@components/Button";
import { Inner as InnerDataTable } from "@components/DataTable";
import Loader from "@components/Loader";
import DataTableLayout from "@components/layouts/DataTableLayout";
import {
  ColumnForSqlDataTableFragment,
  QueryExecutionStatus,
  RowForDataTableFragment,
  useSqlSelectForSqlDataTableQuery,
} from "@gen/graphql-types";
import useSessionQueryHistory from "@hooks/useSessionQueryHistory";
import { SqlQueryParams } from "@lib/params";
import { isMutation } from "@lib/parseSqlQuery";
import { refetchSqlUpdateQueriesCacheEvict } from "@lib/refetchQueries";
import { useEffect, useState } from "react";
import SqlMessage from "./SqlMessage";
import css from "./index.module.css";

type Props = {
  params: SqlQueryParams;
};

type InnerProps = Props & {
  gqlError?: ApolloError;
  executionStatus?: QueryExecutionStatus;
  executionMessage?: string;
  rows?: RowForDataTableFragment[];
  columns?: ColumnForSqlDataTableFragment[];
  client: ApolloClient<NormalizedCacheObject>;
};

function Inner(props: InnerProps) {
  const { addMutation } = useSessionQueryHistory();
  const isMut = isMutation(props.params.q);

  useEffect(() => {
    if (!isMut) return;
    addMutation(props.params.q);
  }, [props.params.q]);

  useEffect(() => {
    if (!isMut) return;
    if (props.gqlError) return;
    // Need timeout here so that queries are not refetched before sql query has
    // time to finish
    setTimeout(() => {
      props.client
        .refetchQueries(refetchSqlUpdateQueriesCacheEvict)
        .catch(console.error);
    }, 300);
  }, [props.gqlError, isMut, props.client]);

  const msg = <SqlMessage {...props} rowsLen={props.rows?.length ?? 0} />;
  return (
    <>
      <DataTableLayout params={props.params}>
        <InnerDataTable
          params={props.params}
          rows={props.rows}
          columns={props.columns}
          loadMore={() => []}
          nextPage={() => []}
          message={msg}
        />
      </DataTableLayout>
      {/* {isMut && !isReadOnlyDatabaseRevisionError(props.gqlError) && (
        <>
          <TransactionCommitMsg {...props} />
          <WorkingDiff {...props} />
        </>
      )} */}
    </>
  );
}

function Query(props: Props) {
  const { data, loading, error, client } = useSqlSelectForSqlDataTableQuery({
    variables: {
      queryString: props.params.q,
    },
    fetchPolicy: "cache-and-network",
  });

  if (loading) return <Loader loaded={false} />;

  return (
    <Inner
      gqlError={error}
      executionStatus={data?.sqlSelect.queryExecutionStatus}
      executionMessage={data?.sqlSelect.queryExecutionMessage}
      rows={data?.sqlSelect.rows}
      columns={data?.sqlSelect.columns}
      params={props.params}
      client={client}
    />
  );
}

export default function SqlDataTable(props: Props) {
  const { queryIsRecentMutation } = useSessionQueryHistory();
  const [runQueryAnyway, setRunQueryAnyway] = useState(false);

  if (queryIsRecentMutation(props.params.q) && !runQueryAnyway) {
    return (
      <div>
        <div className={css.queryRunMsg}>
          Warning: You recently ran this query. Are you sure you want to run it
          again? <Button onClick={() => setRunQueryAnyway(true)}>Yes</Button>
        </div>
        {/* <WorkingDiff {...props} /> */}
      </div>
    );
  }

  return <Query {...props} />;
}
