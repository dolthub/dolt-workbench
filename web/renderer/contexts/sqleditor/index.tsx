import { useApolloClient } from "@apollo/client";
import { improveGqlError } from "@components/SqlDataTable/SqlMessage/utils";
import { createCustomContext } from "@dolthub/react-contexts";
import { isTimeoutError } from "@dolthub/react-components";
import {
  useContextWithError,
  useReactiveWidth,
  useSessionQueryHistory,
  useSetState,
} from "@dolthub/react-hooks";
import {
  QueryExecutionStatus,
  SqlSelectForSqlDataTableDocument,
  SqlSelectForSqlDataTableQuery,
  SqlSelectForSqlDataTableQueryVariables,
} from "@gen/graphql-types";
import useApolloError from "@hooks/useApolloError";
import { getCaughtApolloError } from "@lib/errors/helpers";
import { ApolloErrorType } from "@lib/errors/types";
import { setPendingSqlResult } from "@lib/pendingSqlResult";
import { recordMutation, recordQuery } from "@lib/sessionQueryHistory";
import { sqlQuery } from "@lib/urls";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExecuteProps, Props, SqlEditorContextType } from "./types";

// This context handles the SQL console on the database page and executing queries
export const SqlEditorContext =
  createCustomContext<SqlEditorContextType>("SqlEditorContext");

// SqlEditorProvider should only be used in DatabasePage and the query catalog
// page (to execute queries)
export function SqlEditorProvider(props: Props) {
  const { isMobile } = useReactiveWidth(1024);
  const [editorString, setEditorString] = useState("");
  const [showSqlEditor, setShowSqlEditor] = useState(isMobile);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useApolloError(undefined);
  const [executionMessage, setExecutionMessageState] = useState<
    string | undefined
  >(undefined);
  const [executionError, setExecutionErrorState] = useState<string | undefined>(
    undefined,
  );

  const setExecutionMessage = useCallback((m: string | undefined) => {
    setExecutionMessageState(m);
    if (m) setExecutionErrorState(undefined);
  }, []);

  const setExecutionError = useCallback((m: string | undefined) => {
    setExecutionErrorState(m);
    if (m) setExecutionMessageState(undefined);
  }, []);
  const [modalState, setModalState] = useSetState({
    errorIsOpen: false,
  });
  const router = useRouter();
  const client = useApolloClient();
  const executing = useRef(false);
  const { queryIsRecentMutation } = useSessionQueryHistory(
    props.params.databaseName,
  );

  useEffect(() => {
    setShowSqlEditor(isMobile);
  }, [isMobile]);

  useEffect(() => {
    const clearMessages = () => {
      setExecutionMessageState(undefined);
      setExecutionErrorState(undefined);
    };
    router.events.on("routeChangeStart", clearMessages);
    return () => {
      router.events.off("routeChangeStart", clearMessages);
    };
  }, [router.events]);

  // Handles error modal state
  useEffect(() => {
    if (!err || modalState.errorIsOpen) {
      return;
    }
    setModalState({ errorIsOpen: true });
    setLoading(false);
  }, [err, setModalState, modalState.errorIsOpen, setLoading, setErr]);

  const handleQuery = useCallback(
    (executeProps: ExecuteProps) => {
      if (!executeProps.refName) {
        setErr(new Error("Cannot run select query without ref"));
        return;
      }
      const { href, as } = sqlQuery({
        ...executeProps,
        refName: executeProps.refName,
        q: executeProps.query,
        active: executeProps.expandedSection,
      });
      router.push(href, as).catch(console.error);
    },
    [router, setErr],
  );

  const executeQuery = useCallback(
    async (executeProps: ExecuteProps) => {
      if (!executeProps.refName) {
        setErr(new Error("Cannot run select query without ref"));
        return;
      }
      recordQuery(props.params.databaseName, executeProps.query);
      if (queryIsRecentMutation(executeProps.query)) {
        handleQuery(executeProps);
        return;
      }
      if (executing.current) {
        return;
      }
      executing.current = true;
      setLoading(true);
      try {
        const res = await client.query<
          SqlSelectForSqlDataTableQuery,
          SqlSelectForSqlDataTableQueryVariables
        >({
          query: SqlSelectForSqlDataTableDocument,
          variables: {
            databaseName: executeProps.databaseName,
            refName: executeProps.refName,
            queryString: executeProps.query,
            schemaName: executeProps.schemaName || undefined,
          },
          fetchPolicy: "network-only",
        });
        const status = res.data.sqlSelect.queryExecutionStatus;
        const message = res.data.sqlSelect.queryExecutionMessage || "";
        if (status === QueryExecutionStatus.Error && !isTimeoutError(message)) {
          setExecutionError(message || "Query execution failed");
          return;
        }
        setPendingSqlResult({
          variables: {
            databaseName: executeProps.databaseName,
            refName: executeProps.refName,
            queryString: executeProps.query,
            schemaName: executeProps.schemaName || undefined,
          },
          data: res.data,
        });
        handleQuery(executeProps);
      } catch (e) {
        const apolloErr = getCaughtApolloError(e);
        if (apolloErr && isTimeoutError(apolloErr.message)) {
          handleQuery(executeProps);
        } else {
          setExecutionError(
            improveGqlError(apolloErr)?.message ?? "Query execution failed",
          );
        }
      } finally {
        executing.current = false;
        setLoading(false);
      }
    },
    [
      client,
      handleQuery,
      queryIsRecentMutation,
      setErr,
      setExecutionError,
      props.params.databaseName,
    ],
  );

  const setExecutedQuery = useCallback(
    (query: string, opts?: { isMutation?: boolean }) => {
      setEditorString(query);
      if (opts?.isMutation) {
        recordMutation(props.params.databaseName, query);
      } else {
        recordQuery(props.params.databaseName, query);
      }
    },
    [props.params.databaseName],
  );

  const toggleSqlEditor = useCallback(
    (show?: boolean) => {
      const s = show === undefined ? !showSqlEditor : show;
      setShowSqlEditor(s);
    },
    [showSqlEditor],
  );

  const queryClickHandler = useCallback(
    async (executeProps: ExecuteProps) => {
      setEditorString(executeProps.query);
      toggleSqlEditor(false);
      await executeQuery(executeProps);
    },
    [executeQuery, toggleSqlEditor],
  );

  const setError = useCallback(
    (e: ApolloErrorType) => {
      if (!e) {
        setErr(undefined);
      }
      setErr(e);
    },
    [setErr],
  );

  const value = useMemo(() => {
    return {
      setEditorString,
      setExecutedQuery,
      editorString,
      toggleSqlEditor,
      showSqlEditor,
      executeQuery,
      queryClickHandler,
      error: err,
      setError,
      executionMessage,
      setExecutionMessage,
      executionError,
      setExecutionError,
      loading,
      modalState,
      setModalState,
    };
  }, [
    setEditorString,
    setExecutedQuery,
    editorString,
    toggleSqlEditor,
    showSqlEditor,
    executeQuery,
    queryClickHandler,
    err,
    setError,
    executionMessage,
    setExecutionMessage,
    executionError,
    setExecutionError,
    loading,
    modalState,
    setModalState,
  ]);

  return (
    <SqlEditorContext.Provider value={value}>
      {props.children}
    </SqlEditorContext.Provider>
  );
}

type ReturnType = SqlEditorContextType & {
  queryClickHandler: (p: ExecuteProps) => Promise<void>;
  executeQuery: (p: ExecuteProps) => Promise<void>;
};

export function useSqlEditorContext(expandedSection?: string): ReturnType {
  const ctx = useContextWithError(SqlEditorContext);
  return {
    ...ctx,
    queryClickHandler: async (p: ExecuteProps) => {
      await ctx.queryClickHandler({ ...p, expandedSection });
    },
    executeQuery: async (p: ExecuteProps) => {
      await ctx.executeQuery({ ...p, expandedSection });
    },
  };
}
