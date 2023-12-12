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
import useSqlParser from "@hooks/useSqlParser";
import { SqlQueryParams } from "@lib/params";
import { useState } from "react";
import SqlMessage from "./SqlMessage";
import { isReadOnlyDatabaseRevisionError } from "./SqlMessage/utils";
import WorkingDiff from "./WorkingDiff";
import css from "./index.module.css";
import useSqlQuery from "./useSqlQuery";

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
  const { parseSelectQuery } = useSqlParser();
  const isMut = useSqlQuery(props.params, props.client, props.gqlError);
  console.log(parseSelectQuery(props.params.q));
  const msg = <SqlMessage {...props} rowsLen={props.rows?.length ?? 0} />;
  return (
    <>
      <DataTableLayout params={props.params}>
        <InnerDataTable
          params={props.params}
          rows={props.rows}
          columns={props.columns}
          loadMore={async () => {}}
          message={msg}
        />
      </DataTableLayout>
      {isMut && !isReadOnlyDatabaseRevisionError(props.gqlError) && (
        <WorkingDiff {...props} />
      )}
    </>
  );
}

function Query(props: Props) {
  const { data, loading, error, client } = useSqlSelectForSqlDataTableQuery({
    variables: {
      databaseName: props.params.databaseName,
      refName: props.params.refName,
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
        <WorkingDiff {...props} />
      </div>
    );
  }

  return <Query {...props} />;
}
