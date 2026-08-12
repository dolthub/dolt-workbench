import { ApolloClient } from "@apollo/client";
import { Inner as InnerDataTable } from "@components/DataTable";
import DataTableLayout from "@components/layouts/DataTableLayout";
import { useDataTableContext } from "@contexts/dataTable";
import { useSqlEditorContext } from "@contexts/sqleditor";
import { Button, Loader, isTimeoutError } from "@dolthub/react-components";
import { useSessionQueryHistory } from "@dolthub/react-hooks";
import { Maybe } from "@dolthub/web-utils";
import { QueryExecutionStatus } from "@gen/graphql-types";
import { ApolloErrorType } from "@lib/errors/types";
import { SqlQueryParams } from "@lib/params";
import { useEffect, useState } from "react";
import SqlMessage from "./SqlMessage";
import {
  improveGqlError,
  isReadOnlyDatabaseRevisionError,
} from "./SqlMessage/utils";
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
  useSqlQuery(props.params, props.client, props.state.isMutation, props.error);
  const { setIsMutation } = useDataTableContext();
  const { setExecutionError } = useSqlEditorContext();
  useEffect(() => {
    setIsMutation(props.state.isMutation);
  }, [props.state.isMutation, setIsMutation]);
  useEffect(() => {
    if (props.error) {
      if (isTimeoutError(props.error.message) || props.error.message === "") {
        return;
      }
      setExecutionError(
        improveGqlError(props.error)?.message ?? "INTERNAL_SERVER_ERROR",
      );
      return;
    }
    if (
      props.state.executionStatus === QueryExecutionStatus.Error &&
      props.state.executionMessage &&
      !isTimeoutError(props.state.executionMessage)
    ) {
      setExecutionError(props.state.executionMessage);
    }
  }, [
    props.error,
    props.state.executionStatus,
    props.state.executionMessage,
    setExecutionError,
  ]);
  const msg = (
    <SqlMessage
      params={props.params}
      gqlError={props.error}
      executionMessage={props.state.executionMessage}
      executionStatus={props.state.executionStatus}
      isMutation={props.state.isMutation}
      rowsLen={props.state.rows.length}
    />
  );
  return (
    <>
      <DataTableLayout params={props.params}>
        <InnerDataTable
          rows={props.state.rows}
          columns={props.state.cols}
          loadMore={props.fetchMore}
          message={msg}
          warnings={props.warnings}
          hasMore={props.hasMore}
        />
      </DataTableLayout>
      {props.state.isMutation &&
        !isReadOnlyDatabaseRevisionError(props.error) && (
          <WorkingDiff {...props} />
        )}
    </>
  );
}

function Query(props: Props) {
  const { state, fetchMore, hasMore, loading, client, error } =
    useSqlSelectRows(props.params);

  if (loading) return <Loader loaded={false} />;

  return (
    <Inner
      {...props}
      error={error}
      state={state}
      fetchMore={fetchMore}
      hasMore={hasMore}
      client={client}
    />
  );
}

function RecentMutation(props: Props & { runAgain: () => void }) {
  const { executionMessage } = useSqlEditorContext();
  const { setIsMutation } = useDataTableContext();
  useEffect(() => {
    setIsMutation(true);
  }, [setIsMutation]);

  return (
    <>
      <DataTableLayout params={props.params}>
        <InnerDataTable
          rows={[]}
          columns={[]}
          loadMore={async () => {}}
          hasMore={false}
          message={
            <>
              {executionMessage && (
                <SqlMessage
                  params={props.params}
                  executionMessage={executionMessage}
                  executionStatus={QueryExecutionStatus.Success}
                  isMutation
                  rowsLen={0}
                />
              )}
              <div className={css.queryRunMsg}>
                Warning: You recently ran this query. Are you sure you want to
                run it again? <Button onClick={props.runAgain}>Yes</Button>
              </div>
            </>
          }
        />
      </DataTableLayout>
      <WorkingDiff {...props} />
    </>
  );
}

export default function SqlDataTable(props: Props) {
  const { queryIsRecentMutation } = useSessionQueryHistory(
    props.params.databaseName,
  );
  const [runQueryAnyway, setRunQueryAnyway] = useState(false);

  if (queryIsRecentMutation(props.params.q) && !runQueryAnyway) {
    return (
      <RecentMutation {...props} runAgain={() => setRunQueryAnyway(true)} />
    );
  }

  return <Query {...props} />;
}
