import safeJSONParse from "@lib/safeJSONParse";
import { useState } from "react";

type ReturnType = {
  getLastQuery: () => string | undefined;
  addQuery: (q: string) => void;
  addMutation: (q: string) => void;
  queryIsRecentMutation: (q: string) => boolean;
  getNextQuery: () => string | undefined;
  getPrevQuery: (shouldSkipFirst: (s: string) => boolean) => string | undefined;
  queryIdx: number | undefined;
};

const queryStorageKey = `query-history`;
const mutationStorageKey = `mutation-history`;

export default function useSessionQueryHistory(): ReturnType {
  const [queryIdx, setQueryIdx] = useState<number | undefined>(undefined);

  const getHistory = (key: string): string[] => {
    const item = sessionStorage.getItem(key);
    return item ? safeJSONParse(item) : [];
  };

  const setHistory = (key: string, value: string[]) => {
    sessionStorage.setItem(key, JSON.stringify(value));
  };

  const addQuery = (q: string) => {
    const history = getHistory(queryStorageKey);
    setHistory(queryStorageKey, [q, ...history]);
  };

  const addMutation = (q: string) => {
    const history = getHistory(mutationStorageKey);
    setHistory(mutationStorageKey, [q, ...history]);
  };

  const queryIsRecentMutation = (q: string): boolean => {
    const mutationHistory = getHistory(mutationStorageKey);
    return mutationHistory.slice(0, 20).includes(q);
  };

  const getNextQuery = (): string | undefined => {
    if (queryIdx === undefined || queryIdx === 0) return undefined;
    setQueryIdx(queryIdx - 1);
    const history = getHistory(queryStorageKey);
    return history[queryIdx - 1];
  };

  const getPrevQuery = (
    shouldSkipFirst: (s: string) => boolean,
  ): string | undefined => {
    const history = getHistory(queryStorageKey);
    if (queryIdx === history.length - 1) return undefined;
    const nextIdx = queryIdx === undefined ? 0 : queryIdx + 1;
    const prev = history[nextIdx];
    const idx = shouldSkipFirst(prev) ? nextIdx + 1 : nextIdx;
    setQueryIdx(idx);
    return history[idx];
  };

  const getLastQuery = (): string | undefined => {
    const history = getHistory(queryStorageKey);
    if (history.length === 0) return undefined;
    return history[0];
  };

  return {
    getLastQuery,
    addQuery,
    addMutation,
    queryIsRecentMutation,
    getNextQuery,
    getPrevQuery,
    queryIdx,
  };
}
