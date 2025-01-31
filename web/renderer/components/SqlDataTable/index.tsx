import {
  ApolloClient,
  ApolloError,
  NormalizedCacheObject,
} from "@apollo/client";
import { Inner as InnerDataTable } from "@components/DataTable";
import DataTableLayout from "@components/layouts/DataTableLayout";
import { Button, Loader } from "@dolthub/react-components";
import { useSessionQueryHistory } from "@dolthub/react-hooks";
import {
  ColumnForSqlDataTableFragment,
  QueryExecutionStatus,
  RowForDataTableFragment,
  useSqlSelectForSqlDataTableQuery,
} from "@gen/graphql-types";
import { SqlQueryParams } from "@lib/params";
import { useState } from "react";
import { Maybe } from "@dolthub/web-utils";
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
  warnings?: Maybe<string[]>;
};

function Inner(props: InnerProps) {
  const isMut = useSqlQuery(props.params, props.client, props.gqlError);
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
          warnings={props.warnings}
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
      ...props.params,
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
      warnings={data?.sqlSelect.warnings}
    />
  );
}

export default function SqlDataTable(props: Props) {
  const { queryIsRecentMutation } = useSessionQueryHistory(
    props.params.databaseName,
  );
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
