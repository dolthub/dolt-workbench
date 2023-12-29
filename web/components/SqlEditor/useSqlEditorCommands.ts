import { useSqlEditorContext } from "@contexts/sqleditor";
import { useSetState } from "@dolthub/react-hooks";
import useSessionQueryHistory from "@hooks/useSessionQueryHistory";
import { OptionalRefParams } from "@lib/params";
import { Ace } from "ace-builds";
import { Dispatch, useCallback, useEffect } from "react";
import { ICommand } from "react-ace";

const defaultState = {
  submitting: false,
  gettingPrevQuery: false,
  gettingNextQuery: false,
  queryDraft: "",
};

type SqlCommandsState = typeof defaultState;
type SqlCommandsDispatch = Dispatch<Partial<SqlCommandsState>>;

type ReturnType = {
  setSubmitting: (s: boolean) => void;
  commands: ICommand[];
};

export default function useSqlEditorCommands(
  params: OptionalRefParams,
): ReturnType {
  const { editorString, setEditorString, executeQuery, toggleSqlEditor } =
    useSqlEditorContext("Tables");
  const { getPrevQuery, getNextQuery, queryIdx, getLastQuery } =
    useSessionQueryHistory(params);
  const [state, setState] = useSetState(defaultState);
  const keyBindingCommands = getKeyBindingCommands(setState, toggleSqlEditor);

  const executeNextQuery = useCallback(() => {
    const next = getNextQuery();
    if (next) {
      setEditorString(next);
    } else if (queryIdx === 0 && state.queryDraft) {
      setEditorString(state.queryDraft);
    }
    setState({ gettingNextQuery: false });
  }, [state.gettingNextQuery]);

  const executePrevQuery = useCallback(() => {
    const last = getLastQuery();
    if (!queryIdx && last && last !== editorString) {
      setState({ queryDraft: editorString });
    }
    const shouldSkipFirst = (prev: string): boolean =>
      !queryIdx && prev === editorString;
    const prev = getPrevQuery(shouldSkipFirst);
    if (prev) {
      setEditorString(prev);
    }
    setState({ gettingPrevQuery: false });
  }, [state.gettingPrevQuery]);

  useEffect(() => {
    if (!state.gettingNextQuery) return;
    executeNextQuery();
  }, [state.gettingNextQuery, executeNextQuery]);

  useEffect(() => {
    if (!state.gettingPrevQuery) return;
    executePrevQuery();
  }, [state.gettingPrevQuery, executePrevQuery]);

  useEffect(() => {
    if (!state.submitting) return;
    setState({ submitting: false });
    executeQuery({ ...params, query: editorString }).catch(console.error);
  }, [state.submitting, executeQuery, setState, editorString, params]);

  return {
    setSubmitting: (s: boolean) => setState({ submitting: s }),
    commands: keyBindingCommands,
  };
}

function getKeyBindingCommands(
  setState: SqlCommandsDispatch,
  toggleSqlEditor: (t?: boolean) => void,
): ICommand[] {
  return [
    {
      name: "submit",
      bindKey: { win: "Ctrl-enter", mac: "Command-enter" },
      exec: () => setState({ submitting: true }),
    },
    {
      name: "close-editor",
      bindKey: {
        win: "Ctrl-shift-enter",
        mac: "Command-shift-enter",
      },
      exec: () => toggleSqlEditor(false),
    },
    {
      name: "prev-query",
      bindKey: { win: "Up", mac: "Up" },
      exec: editor => {
        if (cursorAtEditorBeginning(editor)) {
          setState({ gettingPrevQuery: true });
          return true;
        }
        return false;
      },
    },
    {
      name: "next-query",
      bindKey: { win: "Down", mac: "Down" },
      exec: editor => {
        if (cursorAtEditorEnd(editor)) {
          setState({ gettingNextQuery: true });
          return true;
        }
        return false;
      },
    },
  ];
}

function cursorAtEditorBeginning(editor: Ace.Editor): boolean {
  const pos = editor.getCursorPosition();
  return pos.row === 0 && pos.column === 0;
}

function cursorAtEditorEnd(editor: Ace.Editor): boolean {
  const len = editor.session.getLength();
  const lines = editor.session.getLines(0, len - 1);
  const pos = editor.getCursorPosition();
  const isLastRow = pos.row === len - 1;
  const isLastColumn = pos.column === lines[len - 1].length;
  return isLastRow && isLastColumn;
}
