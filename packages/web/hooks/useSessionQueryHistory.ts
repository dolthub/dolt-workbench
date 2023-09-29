import safeJSONParse from "@lib/safeJSONParse";
import { useState } from "react";
import useStateWithSessionStorage from "./useStateWithSessionStorage";

type ReturnType = {
  history: string[];
  addQuery: (q: string) => void;
  addMutation: (q: string) => void;
  queryIsRecentMutation: (q: string) => boolean;
  getNextQuery: () => string | undefined;
  getPrevQuery: (shouldSkipFirst: (s: string) => boolean) => string | undefined;
  queryIdx: number | undefined;
};

export default function useSessionQueryHistory(): ReturnType {
  const [queryIdx, setQueryIdx] = useState<number | undefined>(undefined);
  const [_history, _setHistory] = useStateWithSessionStorage(
    `query-history`,
    "[]",
  );
  const [_mutationHistory, _setMutationHistory] = useStateWithSessionStorage(
    `mutation-history`,
    "[]",
  );

  const history = safeJSONParse(_history);
  const mutationHistory = safeJSONParse(_mutationHistory);
  const setHistory = (h: string[]) => _setHistory(JSON.stringify(h));
  const setMutationHistory = (h: string[]) =>
    _setMutationHistory(JSON.stringify(h));

  const addQuery = (q: string) => {
    setHistory([q, ...history]);
  };

  const addMutation = (q: string) => {
    setMutationHistory([q, ...mutationHistory]);
  };

  const queryIsRecentMutation = (q: string): boolean =>
    mutationHistory.slice(0, 20).includes(q);

  const getNextQuery = (): string | undefined => {
    if (queryIdx === undefined || queryIdx === 0) return undefined;
    setQueryIdx(queryIdx - 1);
    return history[queryIdx - 1];
  };

  const getPrevQuery = (
    shouldSkipFirst: (s: string) => boolean,
  ): string | undefined => {
    if (queryIdx === history.length - 1) return undefined;
    const nextIdx = queryIdx === undefined ? 0 : queryIdx + 1;
    const prev = history[nextIdx];
    const idx = shouldSkipFirst(prev) ? nextIdx + 1 : nextIdx;
    setQueryIdx(idx);
    return history[idx];
  };

  return {
    history,
    addQuery,
    addMutation,
    queryIsRecentMutation,
    getNextQuery,
    getPrevQuery,
    queryIdx,
  };
}
