import {
  useContextWithError,
  useReactiveWidth,
  useSessionQueryHistory,
  useSetState,
} from "@dolthub/react-hooks";
import useApolloError from "@hooks/useApolloError";
import useSqlParser from "@hooks/useSqlParser";
import { createCustomContext } from "@lib/createCustomContext";
import { ApolloErrorType } from "@lib/errors/types";
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
  const { isMultipleQueries } = useSqlParser();
  const { isMobile } = useReactiveWidth(1024);
  const [editorString, setEditorString] = useState("");
  const [showSqlEditor, setShowSqlEditor] = useState(isMobile);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useApolloError(undefined);
  const [modalState, setModalState] = useSetState({
    errorIsOpen: false,
  });
  const router = useRouter();
  const { addQuery } = useSessionQueryHistory(props.params.databaseName);

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
      if (isMultipleQueries(executeProps.query)) {
        setErr(new Error("The SQL workbench doesn't support multiple queries"));
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
      addQuery(executeProps.query);
      setLoading(false);
    },
    [handleQuery, addQuery],
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
      editorString,
      toggleSqlEditor,
      showSqlEditor,
      executeQuery,
      queryClickHandler,
      error: err,
      setError,
      loading,
      modalState,
      setModalState,
    };
  }, [
    setEditorString,
    editorString,
    toggleSqlEditor,
    showSqlEditor,
    executeQuery,
    queryClickHandler,
    err,
    setError,
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
