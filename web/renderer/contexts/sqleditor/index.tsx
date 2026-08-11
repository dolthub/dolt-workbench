import { createCustomContext } from "@dolthub/react-contexts";
import {
  useContextWithError,
  useReactiveWidth,
  useSetState,
} from "@dolthub/react-hooks";
import useApolloError from "@hooks/useApolloError";
import { ApolloErrorType } from "@lib/errors/types";
import { recordMutation, recordQuery } from "@lib/sessionQueryHistory";
import { sqlQuery } from "@lib/urls";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [executionMessage, setExecutionMessage] = useState<string | undefined>(
    undefined,
  );
  const [modalState, setModalState] = useSetState({
    errorIsOpen: false,
  });
  const router = useRouter();

  useEffect(() => {
    setShowSqlEditor(isMobile);
  }, [isMobile]);

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
      setLoading(true);
      handleQuery(executeProps);
      recordQuery(props.params.databaseName, executeProps.query);
      setLoading(false);
    },
    [handleQuery, props.params.databaseName],
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
