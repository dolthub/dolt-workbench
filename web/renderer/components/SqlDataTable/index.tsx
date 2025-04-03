import { ApolloClient } from "@apollo/client";
import { Inner as InnerDataTable } from "@components/DataTable";
import DataTableLayout from "@components/layouts/DataTableLayout";
import { Button, Loader } from "@dolthub/react-components";
import { useSessionQueryHistory } from "@dolthub/react-hooks";
import { SqlQueryParams } from "@lib/params";
import { useState } from "react";
import { Maybe } from "@dolthub/web-utils";
import { ApolloErrorType } from "@lib/errors/types";
import SqlMessage from "./SqlMessage";
import { isReadOnlyDatabaseRevisionError } from "./SqlMessage/utils";
import WorkingDiff from "./WorkingDiff";
import css from "./index.module.css";
import useSqlQuery from "./useSqlQuery";
import useSqlSelectRows, { RowsState } from "./useSqlSelectRows";

type Props = {
  params: SqlQueryParams;
};

type InnerProps = Props & {
  fetchMore: () => Promise<void>;
  state: RowsState;
  hasMore: boolean;
  client: ApolloClient<any>;
  error?: ApolloErrorType;
  warnings?: Maybe<string[]>;
};

function Inner(props: InnerProps) {
  const isMut = useSqlQuery(props.params, props.client, props.error);
  const msg = (
    <SqlMessage
      params={props.params}
      {...props.state}
      rowsLen={props.state.rows.length}
    />
  );
  return (
    <>
      <DataTableLayout params={props.params}>
        <InnerDataTable
          params={props.params}
          rows={props.state.rows}
          columns={props.state.cols}
          loadMore={props.fetchMore}
          message={msg}
          warnings={props.warnings}
          hasMore={props.hasMore}
        />
      </DataTableLayout>
      {isMut && !isReadOnlyDatabaseRevisionError(props.error) && (
        <WorkingDiff {...props} />
      )}
    </>
  );
}

function Query(props: Props) {
  const { state, fetchMore, hasMore, loading, client } = useSqlSelectRows(
    props.params,
  );

  if (loading) return <Loader loaded={false} />;

  return (
    <Inner
      {...props}
      state={state}
      fetchMore={fetchMore}
      hasMore={hasMore}
      client={client}
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
